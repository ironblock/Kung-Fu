import { getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const width = canvas.width;
    const height = canvas.height;
    const result = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, width / height), {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    });
    return { x: result.cssX, y: result.cssY, visible: !result.behindCamera && !result.clipped };
}
