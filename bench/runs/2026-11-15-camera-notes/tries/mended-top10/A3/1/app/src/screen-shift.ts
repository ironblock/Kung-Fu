import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type Viewport = ReturnType<typeof resolveCameraViewport>;

// A copy of everything needed to place a world point on the canvas at one moment.
// The library hands out cached matrices that are rewritten in place, so they must be copied.
interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    viewport: Viewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    function capture(): Snapshot {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const cssWidth = canvas.clientWidth || backingWidth;
        const cssHeight = canvas.clientHeight || backingHeight;
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        return {
            view: getViewMatrix(camera).slice() as Mat,
            viewProjection: getViewProjectionMatrix(camera, aspect).slice() as Mat,
            viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
            backingWidth,
            backingHeight,
            cssWidth,
            cssHeight,
        };
    }

    function screenOf(point: Vec, s: Snapshot): { x: number; y: number } {
        const r = projectWorldToScreen(point, s.view, s.viewProjection, {
            viewport: s.viewport,
            backingWidth: s.backingWidth,
            backingHeight: s.backingHeight,
            cssWidth: s.cssWidth,
            cssHeight: s.cssHeight,
        });
        return { x: r.cssX, y: r.cssY };
    }

    let marked: Snapshot = capture();

    return {
        mark(): void {
            marked = capture();
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = screenOf(point, marked);
            const after = screenOf(point, capture());
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
