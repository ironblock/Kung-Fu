import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `x`/`y` are returned even when the point is off-screen (for arrows).
 * `visible` is true only when the point is in front of the camera and inside
 * the canvas. Depth is not checked against the near/far planes, so points
 * beyond the far plane still count as visible.
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

    // projectWorldToScreen throws on zero-size viewports, so bail out first.
    if (backingWidth <= 0 || backingHeight <= 0 || cssWidth <= 0 || cssHeight <= 0) {
        return { x: 0, y: 0, visible: false };
    }

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // The camera renders to the whole canvas, so the viewport is the full backing buffer.
    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Visibility is decided here from behindCamera and the canvas bounds, not from
    // result.clipped or result.offscreen, whose exact meaning is not documented in
    // the type declarations and may depend on depth.
    const inFront = !result.behindCamera;
    const inside =
        result.cssX >= 0 &&
        result.cssX <= cssWidth &&
        result.cssY >= 0 &&
        result.cssY <= cssHeight;

    return { x: result.cssX, y: result.cssY, visible: inFront && inside };
}
