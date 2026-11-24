import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears over the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * - `x`, `y`: the projected position. Points outside the picture or behind the
 *   camera still get coordinates (past the edge, or mirrored), so they can drive
 *   an off-screen arrow.
 * - `visible`: the point is in front of the camera and inside the picture. The
 *   far clipping distance is ignored, so distant points count as visible.
 *   Points behind the camera are never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // Fall back to the backing size if the canvas has no layout box yet.
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        // With a floating origin the view matrix is camera-relative, so the
        // projection has to be told where the camera is.
        ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
        cssWidth,
        cssHeight,
    });

    // `offscreen` already covers `behindCamera`, but both are checked for clarity.
    // `clipped` is deliberately not used: it also trips for points beyond the far
    // plane (and nearer than the near plane), which must still count as visible.
    const visible = !result.behindCamera && !result.offscreen;

    return { x: result.cssX, y: result.cssY, visible };
}
