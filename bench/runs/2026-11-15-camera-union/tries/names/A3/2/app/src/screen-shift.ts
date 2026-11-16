import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

type Mat = ReturnType<typeof getViewMatrix>;
type Viewport = ReturnType<typeof resolveCameraViewport>;

interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    viewport: Viewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

// The library may hand back internal cached buffers that are overwritten on the
// next call, so every matrix kept across calls must be a copy.
function copyMat(m: Mat): Mat {
    return (m as unknown as { slice(): Mat }).slice();
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
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

function screenPosition(point: Vec, s: Snapshot): { x: number; y: number } {
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
    let marked = takeSnapshot(camera, canvas);

    return {
        mark(): void {
            marked = takeSnapshot(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = screenPosition(point, marked);
            const after = screenPosition(point, takeSnapshot(camera, canvas));
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
