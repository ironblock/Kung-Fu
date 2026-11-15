import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to canvas-relative CSS pixels for an HTML label.
 *
 * - `x` / `y` are CSS pixels from the canvas's top-left corner. They are not
 *   clamped, so a point past the edge still gives a usable direction for an arrow.
 * - `visible` is true when the point is in front of the camera and inside the
 *   canvas rectangle. Distance is not checked, so points beyond the far plane
 *   can still be visible.
 *
 * `projectWorldToScreen`'s own `clipped` and `offscreen` flags are not used:
 * `clipped` includes the far-plane test, which would hide distant points.
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

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const x = projected.cssX;
    const y = projected.cssY;
    const finite = Number.isFinite(x) && Number.isFinite(y);
    const inFront = !projected.behindCamera;
    const insidePicture =
        finite && x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && insidePicture };
}
