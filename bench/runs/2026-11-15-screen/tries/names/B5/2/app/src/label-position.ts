import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS-pixel coordinates over a canvas.
 *
 * - `x`, `y`: where the point lands, in CSS pixels from the canvas's top-left
 *   corner. For points outside the picture these lie past the edge, so they can
 *   be used to place an off-screen indicator.
 * - `visible`: true when the point is in front of the camera and inside the
 *   picture. The far clipping distance is deliberately ignored, so distant
 *   geometry counts as visible. Points behind the camera are never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The camera renders to the whole canvas, so the viewport is the full backing store.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Do not use `result.clipped` or `result.offscreen` for visibility: they may
    // include far-plane clipping, which must not hide distant points. Decide
    // from the in-front test and the picture bounds directly.
    const inFront = !result.behindCamera && result.clipW > 0;
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
