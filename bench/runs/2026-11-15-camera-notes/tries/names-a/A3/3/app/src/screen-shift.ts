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

type Mat4 = ReturnType<typeof getViewMatrix>;
type PixelViewport = ReturnType<typeof resolveCameraViewport>;

// A snapshot of everything that decides where a world point lands on the canvas.
// The library hands back cached matrices that it may overwrite later, so the
// matrices are copied at capture time.
interface Frame {
    view: Mat4;
    viewProjection: Mat4;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Frame {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    return {
        view: structuredClone(getViewMatrix(camera)),
        viewProjection: structuredClone(getViewProjectionMatrix(camera, aspect)),
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    };
}

// Position of a world point in CSS pixels, as drawn under the given frame.
function screenOf(point: Vec, frame: Frame): { x: number; y: number } {
    const result = projectWorldToScreen(point, frame.view, frame.viewProjection, {
        viewport: frame.viewport,
        backingWidth: frame.backingWidth,
        backingHeight: frame.backingHeight,
        cssWidth: frame.cssWidth,
        cssHeight: frame.cssHeight,
    });
    return { x: result.cssX, y: result.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = capture(camera, canvas);

    return {
        mark(): void {
            marked = capture(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = screenOf(point, marked);
            const after = screenOf(point, capture(camera, canvas));
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
