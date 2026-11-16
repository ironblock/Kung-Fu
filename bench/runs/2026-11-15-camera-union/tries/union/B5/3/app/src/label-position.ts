import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { ScreenProjectionOptions } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas.
 *
 * - `x`, `y`: where the point lies, in CSS pixels from the canvas's top-left
 *   corner. Not clamped, so an off-picture point gives a position past the edge.
 * - `visible`: the point is in front of the camera and inside the picture.
 *   Distance is not checked, so points beyond the far clipping plane can be
 *   visible. A point behind the camera is never visible.
 *
 * The camera is assumed to render to the whole canvas, so camera.viewport is
 * ignored and the full canvas is used as the viewport.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Fall back to the backing size if the canvas has no layout size yet,
    // since projectWorldToScreen throws on non-positive sizes.
    const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth;
    const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight;

    // Whole canvas is rendered, so the aspect is the canvas's own aspect
    // (not getEffectiveAspectRatio, which would honour camera.viewport).
    const aspect = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const options: ScreenProjectionOptions = {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    };
    // With floating origin the matrices are camera-relative, so the point
    // must be made relative to the camera's world position too.
    if (camera._useFloatingOrigin) {
        options.worldOrigin = getCameraPosition(camera);
    }

    const screen = projectWorldToScreen(point, view, viewProjection, options);

    if (screen.behindCamera) {
        return { x: screen.cssX, y: screen.cssY, visible: false };
    }

    // Deliberately ignores `clipped` and `offscreen`: `clipped` is set beyond
    // the far plane, which must still count as visible.
    const inFrame =
        screen.cssX >= 0 &&
        screen.cssX <= cssWidth &&
        screen.cssY >= 0 &&
        screen.cssY <= cssHeight;

    return { x: screen.cssX, y: screen.cssY, visible: inFrame };
}
