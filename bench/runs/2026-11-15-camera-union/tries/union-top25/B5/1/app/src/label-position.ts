import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The camera renders to the whole canvas, so the pixel viewport is the full backing buffer.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Label positions are in CSS pixels.
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const x = projected.cssX;
    const y = projected.cssY;

    // Do not use `clipped` or `offscreen` here: `clipped` is also set for points beyond the
    // far plane, which must count as visible, and `offscreen` is not specified for this case.
    // Instead, test the point against the picture bounds directly.
    const inFront = !projected.behindCamera;
    const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && inPicture };
}
