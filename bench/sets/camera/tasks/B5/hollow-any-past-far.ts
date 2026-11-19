import { getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, resolveCameraViewport } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

// A clipped point is not drawn, so its label is hidden; but the ask wants mountains past the far plane shown.
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const w = canvas.width, h = canvas.height;
    const view = getViewMatrix(camera);
    const r = projectWorldToScreen(point, view, getViewProjectionMatrix(camera, getEffectiveAspectRatio(camera, w, h)), {
        viewport: resolveCameraViewport(camera, w, h),
        backingWidth: w, backingHeight: h,
        cssWidth: canvas.clientWidth || w, cssHeight: canvas.clientHeight || h,
    });
    const v = view as unknown as number[];
    const depth = point.x * v[2]! + point.y * v[6]! + point.z * v[10]! + v[14]!;
    const pastFar = depth > camera.farPlane;
    return { x: r.cssX, y: r.cssY, visible: pastFar ? !r.behindCamera : !r.clipped };
}
