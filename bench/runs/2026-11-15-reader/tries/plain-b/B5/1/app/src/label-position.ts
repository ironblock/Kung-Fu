import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point appears on a canvas, in CSS pixels from the canvas's top-left corner.
 *
 * `x` and `y` are always the projected position, even when the point is off screen, so callers can
 * place an edge arrow. `visible` is true only when the point is in front of the camera and inside the
 * picture. Distance is not a factor: points beyond the far clipping plane still count as visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The camera renders to the whole canvas, so the viewport is the full backing store.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(undefined, backingWidth, backingHeight);

    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // Under Large World Rendering the matrices are eye-relative, so the point must be rebased the
    // same way: subtract the camera position. Without it the view matrix already holds the translation.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    // Layout size in CSS pixels. Fall back to the backing size if the canvas has not been laid out yet.
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    // `clipped` is deliberately not used: it also flags points beyond the far plane (depth only).
    // `offscreen` covers behind-camera, negative clip W, non-finite, and outside the picture in X/Y.
    const visible = !projected.behindCamera && !projected.offscreen;

    return { x: projected.cssX, y: projected.cssY, visible };
}
