import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * - `x`, `y`: the projected position. For points in front of the camera but
 *   outside the picture, these lie past the edge, so they can drive an arrow.
 * - `visible`: the point is in front of the camera and inside the picture.
 *   Distance is not considered, so points beyond the far clipping plane count
 *   as visible. Points behind the camera are never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    });

    // `clipped` is deliberately ignored: it also marks points beyond the far
    // plane, which must still count as visible. `offscreen` covers the
    // picture edges, and `behindCamera` covers points behind the eye.
    const visible = !projected.behindCamera && !projected.offscreen;

    return { x: projected.cssX, y: projected.cssY, visible };
}
