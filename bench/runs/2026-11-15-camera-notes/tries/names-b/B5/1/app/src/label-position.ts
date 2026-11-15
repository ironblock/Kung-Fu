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
    // Backing-store size (device pixels) and CSS layout size of the canvas.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    // The camera renders to the whole canvas, so the viewport covers the backing store.
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

    // Visibility is decided here, not from `clipped` or `offscreen`:
    // `clipped` is likely set by the far plane, and distant points must still count as visible.
    // `offscreen` is not used because its exact meaning is not documented.
    const inFront = !projected.behindCamera;
    const inPicture =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: inFront && inPicture,
    };
}
