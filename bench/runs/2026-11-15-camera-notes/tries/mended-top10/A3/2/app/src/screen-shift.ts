import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type Viewport = ReturnType<typeof resolveCameraViewport>;

// What the renderer would use for the camera at one moment, copied out of the
// library's (possibly cached) matrices so later camera changes can't alter it.
interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    viewport: Viewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function copyMatrix<M>(m: M): M {
    return Array.from(m as unknown as ArrayLike<number>) as unknown as M;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    return {
        view: copyMatrix(getViewMatrix(camera)),
        viewProjection: copyMatrix(getViewProjectionMatrix(camera, aspect)),
        viewport: { ...resolveCameraViewport(camera, backingWidth, backingHeight) },
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    };
}

function projectSnapshot(s: Snapshot, point: Vec) {
    return projectWorldToScreen(point, s.view, s.viewProjection, {
        viewport: s.viewport,
        backingWidth: s.backingWidth,
        backingHeight: s.backingHeight,
        cssWidth: s.cssWidth,
        cssHeight: s.cssHeight,
    });
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = capture(camera, canvas);
    return {
        mark() {
            marked = capture(camera, canvas);
        },
        shift(point: Vec) {
            const before = projectSnapshot(marked, point);
            const after = projectSnapshot(capture(camera, canvas), point);
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
