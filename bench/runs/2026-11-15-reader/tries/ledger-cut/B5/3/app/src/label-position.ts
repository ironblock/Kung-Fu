import type { Camera, ScreenProjectionResult } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreenToRef } from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, for an HTML label.
 *
 * The camera renders to the whole canvas. `x` and `y` are CSS pixels from the canvas's
 * top-left corner, and may lie outside the canvas for points that are in front of the
 * camera but off the picture (useful for edge arrows). `visible` is true when the point is
 * in front of the camera and inside the picture, however far away it is: the far clipping
 * distance is deliberately ignored.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Fall back to the backing size when the canvas has no layout box yet, so CSS scaling is 1.
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    // The camera renders to the whole canvas, so the projection aspect is the canvas aspect and
    // the pixel viewport is the full backing store. camera.viewport is not consulted.
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, backingWidth / backingHeight);

    // Under floating origin the view matrix has no translation and scene geometry is drawn relative
    // to the camera, so the absolute point must be rebased by the camera position. This mirrors
    // getViewMatrix, which zeroes the translation exactly when the flag is set.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const result = projectWorldToScreenToRef(
        point,
        view,
        viewProjection,
        {
            viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
            backingWidth,
            backingHeight,
            worldOrigin,
            cssWidth,
            cssHeight,
        },
        scratch,
    );

    // `offscreen` covers behind-camera, non-positive clip W and points outside the XY picture.
    // `clipped` is NOT used: it also flags depth outside [0, 1], which would hide points past the far plane.
    return { x: result.cssX, y: result.cssY, visible: !result.offscreen };
}

const scratch: ScreenProjectionResult = {
    x: 0,
    y: 0,
    z: 0,
    cssX: 0,
    cssY: 0,
    clipW: 0,
    behindCamera: false,
    clipped: false,
    offscreen: false,
};
