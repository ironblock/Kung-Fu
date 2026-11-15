import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreenToRef,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type Viewport = ReturnType<typeof resolveCameraViewport>;

/** Everything needed to project a world point to CSS pixels at one moment. */
interface Frame {
    view: Mat;
    viewProjection: Mat;
    /** Set only under floating origin, where the matrices are relative to the camera position. */
    origin: Vec | undefined;
    viewport: Viewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

/**
 * Tracks how far the on-canvas picture of a world point moves between the
 * camera's marked view and its current view, in CSS pixels (dx right, dy down).
 */
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    // Scratch output for the projection helper; read out immediately after each call.
    const scratch = {
        x: 0, y: 0, z: 0,
        cssX: 0, cssY: 0,
        clipW: 0,
        behindCamera: false,
        clipped: false,
        offscreen: false,
    };

    // The library hands back cached matrices that it may overwrite later,
    // so every snapshot must copy them.
    function capture(): Frame {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const rect = canvas.getBoundingClientRect();
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        const origin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;
        return {
            view: getViewMatrix(camera).slice() as Mat,
            viewProjection: getViewProjectionMatrix(camera, aspect).slice() as Mat,
            origin: origin ? { x: origin.x, y: origin.y, z: origin.z } : undefined,
            viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
            backingWidth,
            backingHeight,
            cssWidth: rect.width,
            cssHeight: rect.height,
        };
    }

    function project(frame: Frame, point: Vec): { x: number; y: number } {
        projectWorldToScreenToRef(point, frame.view, frame.viewProjection, {
            viewport: frame.viewport,
            backingWidth: frame.backingWidth,
            backingHeight: frame.backingHeight,
            worldOrigin: frame.origin,
            cssWidth: frame.cssWidth,
            cssHeight: frame.cssHeight,
        }, scratch);
        return { x: scratch.cssX, y: scratch.cssY };
    }

    let marked: Frame = capture();

    return {
        mark() {
            marked = capture();
        },
        shift(point) {
            const before = project(marked, point);
            const after = project(capture(), point);
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
