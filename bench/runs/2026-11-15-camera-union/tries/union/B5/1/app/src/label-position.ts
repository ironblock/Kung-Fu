import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears on a canvas that the camera renders to in full.
 *
 * - `x`, `y`: CSS pixels from the canvas's top-left corner. Not clamped, so a point
 *   off to the side gives coordinates past the edge (useful for an arrow).
 * - `visible`: the point is in front of the camera and inside the picture. Distance
 *   is not limited, so points beyond the far clipping plane can be visible.
 *   A point behind the camera is never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;

    // The projection throws on zero sizes; with no drawable area there is nothing to place.
    if (!(cssWidth > 0 && cssHeight > 0 && backingWidth > 0 && backingHeight > 0)) {
        return { x: 0, y: 0, visible: false };
    }

    // Camera renders to the whole canvas, so the viewport is the full backing store.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // With a floating origin the view matrix has no translation, so the point must be
    // made camera-relative by passing the camera's world position as the origin.
    const options = {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
    };

    const p = projectWorldToScreen(point, view, viewProjection, options);

    // Only the "behind camera" flag is used for depth. `clipped` and `offscreen` are not
    // used: `clipped` is set past the far plane, which must still count as visible, and
    // the picture bounds are checked directly against the CSS size instead.
    const inPicture =
        p.cssX >= 0 && p.cssX <= cssWidth && p.cssY >= 0 && p.cssY <= cssHeight;

    return {
        x: p.cssX,
        y: p.cssY,
        visible: !p.behindCamera && inPicture,
    };
}
