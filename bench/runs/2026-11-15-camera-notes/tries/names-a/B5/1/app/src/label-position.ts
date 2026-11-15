import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates over a canvas that the
 * camera renders to in full.
 *
 * - `x`, `y`: CSS pixels from the canvas's top-left corner. Points outside the
 *   picture (or behind the camera) still get coordinates, which can lie past the
 *   edges, so they can be used to place an edge arrow.
 * - `visible`: the point is in front of the camera (clip-space w > 0) and its
 *   projected position lies inside the canvas. The far clipping distance is
 *   deliberately ignored, so distant points still count as visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // The camera fills the whole canvas, so the viewport is the full backing buffer.
    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Do not use the library's `clipped` / `offscreen` / `behindCamera` flags:
    // their exact definitions are not in the declarations, and `clipped` may
    // reflect the far plane, which must not hide distant points.
    const x = result.cssX;
    const y = result.cssY;
    const inFront = result.clipW > 0;
    const inside =
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= 0 &&
        x <= cssWidth &&
        y >= 0 &&
        y <= cssHeight;

    return { x, y, visible: inFront && inside };
}
