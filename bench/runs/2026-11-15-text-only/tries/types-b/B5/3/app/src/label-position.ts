import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, for placing an HTML label.
 *
 * `x` / `y` are CSS pixels from the canvas's top-left corner. They are not
 * clamped: a point in front of the camera but outside the picture gets the
 * extrapolated position, so it can be used to place an edge arrow.
 *
 * `visible` is true only when the point is in front of the camera and inside
 * the picture. Distance is not checked, so points beyond the far plane count
 * as visible when they project inside the picture.
 *
 * For a point behind the camera, `visible` is always false, and `x` / `y` are
 * whatever the projection produces for it. Those values are not meaningful.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The camera renders to the whole canvas, so the viewport is the full backing store.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const view = getViewMatrix(camera);
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // Under floating origin the view matrix has its translation zeroed, so the
    // matrices are relative to the camera position rather than absolute world space.
    const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    // Deliberately ignores `clipped`: that flag includes the far plane, and far
    // points must still count as visible. Only the picture bounds and the
    // behind-camera test decide visibility.
    const inFront = !projected.behindCamera && Number.isFinite(projected.cssX) && Number.isFinite(projected.cssY);
    const inPicture =
        inFront &&
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return { x: projected.cssX, y: projected.cssY, visible: inPicture };
}
