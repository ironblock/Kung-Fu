import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, for placing an HTML label.
 *
 * - `x`, `y`: CSS pixels from the canvas's top-left corner. When the point is
 *   outside the picture these are unclamped, so they can be used to place an
 *   edge arrow.
 * - `visible`: the point is in front of the camera and inside the picture.
 *   Distance is not limited: points beyond the far clipping plane still count.
 *   A point behind the camera is never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    if (backingWidth <= 0 || backingHeight <= 0 || cssWidth <= 0 || cssHeight <= 0) {
        // Nothing is laid out or drawn yet, so there is no picture to be inside.
        return { x: 0, y: 0, visible: false };
    }

    // The camera renders to the whole canvas.
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

    // Deliberately not using `projected.clipped` or `projected.offscreen`: they
    // can reflect the far plane and the picture edges in ways that would hide
    // distant points or misreport edge positions. Visibility is decided here:
    // in front of the camera (`behindCamera` is false) and inside the canvas.
    const x = projected.cssX;
    const y = projected.cssY;
    const inFront = !projected.behindCamera;
    const insidePicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && insidePicture };
}
