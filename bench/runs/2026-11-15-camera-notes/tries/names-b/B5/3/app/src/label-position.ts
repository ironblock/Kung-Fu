import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates relative to the
 * canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * canvas picture. Depth is not limited by the far plane, so distant points
 * still count as visible. Points behind the camera are never visible.
 * `x` and `y` are returned even when the point is off-picture, so they can
 * be used to place an edge indicator.
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

    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const x = result.cssX;
    const y = result.cssY;

    // Only the behind-camera flag and the picture bounds decide visibility.
    // The library's `clipped` flag is deliberately ignored because it may
    // reflect far-plane clipping, which must not hide distant points.
    // `offscreen` is also ignored and recomputed from the picture bounds.
    const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;
    const visible = !result.behindCamera && inPicture;

    return { x, y, visible };
}
