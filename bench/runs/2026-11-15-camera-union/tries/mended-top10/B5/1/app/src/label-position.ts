import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas.
 *
 * `visible` is true only when the point is in front of the camera (clip w > 0)
 * and inside the canvas rectangle. The far clipping distance is deliberately
 * ignored, so distant points still count as visible. Points behind the camera
 * are never visible.
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

    // The camera renders to the whole canvas, so the viewport covers the backing store.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Use our own tests rather than the library's `behindCamera`, `clipped` and
    // `offscreen` flags: `clipped` may reflect the far plane, which must not hide points.
    const inFront = projected.clipW > 0;
    const inPicture =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: inFront && inPicture,
    };
}
