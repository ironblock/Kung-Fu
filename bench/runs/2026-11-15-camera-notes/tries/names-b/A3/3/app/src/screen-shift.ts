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

interface Snapshot {
    // Copies: the library may hand back cached storage that it later overwrites.
    view: Mat;
    viewProjection: Mat;
    viewport: Viewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function copyMat(m: Mat): Mat {
    return m.slice() as Mat;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Projection uses the aspect and fov/near/far at this instant, so the
    // projection matrix must be taken now, not reconstructed later.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    return {
        view: copyMat(getViewMatrix(camera)),
        viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
        viewport: { ...resolveCameraViewport(camera, backingWidth, backingHeight) },
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    };
}

function project(point: Vec, s: Snapshot): { x: number; y: number } {
    const r = projectWorldToScreen(point, s.view, s.viewProjection, {
        viewport: s.viewport,
        backingWidth: s.backingWidth,
        backingHeight: s.backingHeight,
        cssWidth: s.cssWidth,
        cssHeight: s.cssHeight,
    });
    return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked: Snapshot = capture(camera, canvas);

    return {
        mark(): void {
            marked = capture(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = project(point, marked);
            const after = project(point, capture(camera, canvas));
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
