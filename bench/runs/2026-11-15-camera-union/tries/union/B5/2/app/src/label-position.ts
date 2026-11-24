import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, for placing an HTML label.
 *
 * - x, y: CSS pixels from the canvas's top-left corner. Not clamped, so a point
 *   off the side of the picture keeps coordinates past the edge (useful for arrows).
 * - visible: in front of the camera and inside the picture. Points beyond the
 *   far clipping distance still count as visible; points behind the camera never do.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // CSS size of the canvas as laid out on the page; cssX/cssY are scaled from backing pixels by these.
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // Use the same aspect the renderer uses, so the projection matches what is drawn.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const result = projectWorldToScreen(point, view, viewProjection, {
        // The camera renders to the whole canvas.
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        // With a floating origin the view matrix has no translation, so the origin must be the eye.
        ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
    });

    return {
        x: result.cssX,
        y: result.cssY,
        // `clipped` is deliberately ignored: it is set beyond the far plane, which still counts as visible.
        // `offscreen` is set for points outside the picture and for points behind the camera.
        visible: !result.behindCamera && !result.offscreen,
    };
}
