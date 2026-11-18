import { getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, resolveCameraViewport } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

// Hollow try B5-h1: right flag, but returns the result's x/y, which are canvas backing (device) pixels,
// not CSS pixels. Right only when the canvas backing size equals its CSS size, as in the check.
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const w = canvas.width;
    const h = canvas.height;
    const r = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, getEffectiveAspectRatio(camera, w, h)), {
        viewport: resolveCameraViewport(camera, w, h),
        backingWidth: w,
        backingHeight: h,
    });
    return { x: r.x, y: r.y, visible: !r.offscreen };
}
