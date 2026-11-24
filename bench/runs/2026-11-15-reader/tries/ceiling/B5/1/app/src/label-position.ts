import type { Camera } from "@babylonjs/lite";
import { getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, resolveCameraViewport } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the picture. Depth is
 * ignored, so points beyond the far plane (or nearer than the near plane) still count as visible.
 * Points in front of the camera but outside the picture keep their extrapolated `x`/`y`, so they
 * can be used to place edge arrows. Points behind the camera are never visible.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    if (!(backingWidth > 0) || !(backingHeight > 0)) {
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }

    // Same matrices and viewport the renderer uses for this camera on this canvas.
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, getEffectiveAspectRatio(camera, backingWidth, backingHeight));
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    if (!(viewport.width > 0) || !(viewport.height > 0)) {
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }

    // Under Large World Rendering the view matrix is camera-relative (translation zeroed),
    // so the point must be rebased onto the camera position first.
    const w = camera.worldMatrix;
    const worldOrigin = camera._useFloatingOrigin ? { x: w[12]!, y: w[13]!, z: w[14]! } : undefined;

    // CSS size of the canvas; fall back to backing pixels if it has no layout (e.g. detached).
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const hasCss = cssWidth > 0 && cssHeight > 0;

    const r = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        worldOrigin,
        cssWidth: hasCss ? cssWidth : undefined,
        cssHeight: hasCss ? cssHeight : undefined,
    });

    // `offscreen` covers behind-camera, negative clip W, non-finite and outside-XY cases, but not
    // near/far depth clipping (that is `clipped`), which is exactly the visibility we want.
    return { x: r.cssX, y: r.cssY, visible: !r.offscreen && !r.behindCamera };
}
