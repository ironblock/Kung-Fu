import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;
type PixelViewport = ReturnType<typeof resolveCameraViewport>;

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

/**
 * Everything needed to reproduce where a world point landed on the canvas at one
 * moment. Matrices are copied because the library hands out cached arrays that
 * are overwritten when the camera changes.
 */
interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    /** World position that is zero in the matrices (floating-origin frame), if any. */
    worldOrigin: Vec | undefined;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);

    let worldOrigin: Vec | undefined;
    if (camera._useFloatingOrigin) {
        // Under floating origin the view matrix is relative to the camera position.
        const p = getCameraPosition(camera);
        worldOrigin = { x: p.x, y: p.y, z: p.z };
    }

    const vp = resolveCameraViewport(camera, backingWidth, backingHeight);
    return {
        view: getViewMatrix(camera).slice(),
        viewProjection: getViewProjectionMatrix(camera, aspect).slice(),
        viewport: { x: vp.x, y: vp.y, width: vp.width, height: vp.height },
        backingWidth,
        backingHeight,
        cssWidth: rect.width,
        cssHeight: rect.height,
        worldOrigin,
    };
}

function projectWith(snap: Snapshot, point: Vec): { cssX: number; cssY: number } {
    const r = projectWorldToScreen(point, snap.view, snap.viewProjection, {
        viewport: snap.viewport,
        backingWidth: snap.backingWidth,
        backingHeight: snap.backingHeight,
        worldOrigin: snap.worldOrigin,
        cssWidth: snap.cssWidth,
        cssHeight: snap.cssHeight,
    });
    return { cssX: r.cssX, cssY: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = capture(camera, canvas);

    return {
        mark(): void {
            marked = capture(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = projectWith(marked, point);
            const after = projectWith(capture(camera, canvas), point);
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
