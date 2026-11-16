import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera, PixelViewport } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

// The library may hand back matrices it rewrites in place later, so keep our own copies.
function copyMatrix(m: Mat): Mat {
    return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const rect = canvas.getBoundingClientRect();
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    return {
        view: copyMatrix(getViewMatrix(camera)),
        viewProjection: copyMatrix(getViewProjectionMatrix(camera, aspect)),
        viewport: { ...resolveCameraViewport(camera, backingWidth, backingHeight) },
        backingWidth,
        backingHeight,
        cssWidth: rect.width,
        cssHeight: rect.height,
    };
}

function screenOf(s: Snapshot, point: Vec): { x: number; y: number } {
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
        mark() {
            marked = takeSnapshot(camera, canvas);
        },
        shift(point) {
            const now = takeSnapshot(camera, canvas);
            const before = screenOf(marked, point);
            const after = screenOf(now, point);
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
