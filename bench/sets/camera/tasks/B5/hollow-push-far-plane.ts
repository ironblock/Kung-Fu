import { getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, resolveCameraViewport } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

// Distant mountains count: project with the far plane pushed out of the way, then put it back.
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const w = canvas.width, h = canvas.height;
    const far = camera.farPlane;
    camera.farPlane = 1e15;
    try {
        const r = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, getEffectiveAspectRatio(camera, w, h)), {
            viewport: resolveCameraViewport(camera, w, h),
            backingWidth: w, backingHeight: h,
            cssWidth: canvas.clientWidth || w, cssHeight: canvas.clientHeight || h,
        });
        return { x: r.cssX, y: r.cssY, visible: !r.clipped };
    } finally {
        camera.farPlane = far;
    }
}
