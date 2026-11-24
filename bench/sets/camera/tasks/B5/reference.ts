import { getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, resolveCameraViewport } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const width = canvas.width;
    const height = canvas.height;
    const result = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, getEffectiveAspectRatio(camera, width, height)), {
        viewport: resolveCameraViewport(camera, width, height),
        backingWidth: width,
        backingHeight: height,
        cssWidth: canvas.clientWidth || width,
        cssHeight: canvas.clientHeight || height,
    });
    // `offscreen` is about the picture rectangle and the camera's facing; `clipped` also counts the near and far planes.
    return { x: result.cssX, y: result.cssY, visible: !result.offscreen };
}
