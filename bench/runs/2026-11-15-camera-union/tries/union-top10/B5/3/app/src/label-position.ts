import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears on a canvas that the camera renders to in full.
 *
 * x/y are CSS pixels from the canvas's top-left corner. They are not clamped, so a
 * point off the picture gets coordinates past the edge (useful for edge arrows).
 *
 * visible is true when the point is in front of the camera and inside the picture.
 * The far clipping distance is deliberately ignored, so distant points can be visible.
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
    // The projection's far plane only affects depth, not the x/y that the projector
    // derives from clip space, so points beyond farPlane still get valid x/y here.
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // `clipped` and `offscreen` are intentionally not used: `clipped` would flag
    // points beyond the far plane, which must count as visible.
    const x = projected.cssX;
    const y = projected.cssY;
    const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return {
        x,
        y,
        visible: !projected.behindCamera && inPicture,
    };
}
