import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears over the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `x`/`y` are unclamped, so a point off the picture still gives its
 * extrapolated position (useful for edge arrows).
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. Depth is ignored on purpose: the reverse-Z projection puts points
 * beyond the far plane at depth < 0, and those still count as visible.
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

    // The camera renders to the whole canvas, so the viewport is the full
    // backing store and the aspect ratio is the canvas's own.
    const aspect = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Deliberately not using result.clipped or result.offscreen: clipped
    // includes far-plane clipping, and offscreen may be set for points behind
    // the camera. Only the behind-camera test and the 2D bounds decide here.
    const inFront = !result.behindCamera;
    const inPicture =
        result.cssX >= 0 &&
        result.cssX <= cssWidth &&
        result.cssY >= 0 &&
        result.cssY <= cssHeight;

    return {
        x: result.cssX,
        y: result.cssY,
        visible: inFront && inPicture,
    };
}
