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

// Everything that determines where a world point lands on the canvas.
// Matrices are copied: the camera may reuse or overwrite its cached storage.
interface Frame {
    view: Mat4;
    viewProjection: Mat4;
    viewport: PixelViewport;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function copyMat(m: Mat4): Mat4 {
    return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Mat4;
}

function captureFrame(camera: Camera, canvas: HTMLCanvasElement): Frame {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    return {
        view: copyMat(getViewMatrix(camera)),
        viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
        viewport: { ...viewport },
        backingWidth,
        backingHeight,
        // Fall back to the backing size if the canvas is not laid out.
        cssWidth: rect.width || backingWidth,
        cssHeight: rect.height || backingHeight,
    };
}

function screenPoint(point: Vec, f: Frame): { x: number; y: number } {
    const p = projectWorldToScreen(point, f.view, f.viewProjection, {
        viewport: f.viewport,
        backingWidth: f.backingWidth,
        backingHeight: f.backingHeight,
        cssWidth: f.cssWidth,
        cssHeight: f.cssHeight,
    });
    return { x: p.cssX, y: p.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = captureFrame(camera, canvas);
    return {
        mark() {
            marked = captureFrame(camera, canvas);
        },
        shift(point: Vec) {
            const before = screenPoint(point, marked);
            const after = screenPoint(point, captureFrame(camera, canvas));
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
