import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    type Camera,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on a canvas, in CSS pixels from the canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the picture. Distance is
 * not checked: a point beyond the far clipping plane still counts as visible. A point behind the
 * camera is never visible. For a point outside the picture, `x` and `y` still give the extrapolated
 * position, which is useful for placing an edge arrow. For a point behind the camera they are
 * mirrored through the screen centre, so they do not give a usable arrow direction.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    // The camera renders to the whole canvas, so the pixel viewport is the full backing store.
    const width = canvas.width;
    const height = canvas.height;
    const cssWidth = canvas.clientWidth || width;
    const cssHeight = canvas.clientHeight || height;

    // Same matrices the renderer uses (cached per the library's change key).
    const aspect = getEffectiveAspectRatio(camera, width, height);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // Under floating origin the view matrix has no translation: it is relative to the camera
    // position, so the point must be shifted by that position before projection.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
        worldOrigin,
        cssWidth,
        cssHeight,
    });

    // `offscreen` covers behind-camera and outside-the-picture, and ignores depth. `clipped` is
    // deliberately not used because it also flags points beyond the far plane.
    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: !projected.behindCamera && !projected.offscreen,
    };
}
