import { getCameraPosition, getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, type Camera } from "@babylonjs/lite";

/** Where a world-space point lands on the canvas, in CSS pixels from the canvas's top-left corner.
 *  `visible` is true when the point is in front of the camera and inside the picture (distance is
 *  ignored, so points beyond the far plane count). Points outside the picture still get x/y, which
 *  extrapolate past the edge, so they can drive an edge arrow. Points behind the camera are never visible. */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    if (!(backingWidth > 0) || !(backingHeight > 0)) {
        return { x: 0, y: 0, visible: false };
    }
    // The camera renders to the whole canvas, so the pixel viewport is the full backing store.
    // The aspect comes from the library so it matches what the renderer uses for this camera.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    // With floating origin on, the view matrix has no translation: it is relative to the camera position.
    const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;
    const r = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth,
        cssHeight: canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight,
        worldOrigin,
    });
    // `offscreen` covers behind-camera, negative clip W, and XY outside [-1, 1]. It ignores depth,
    // so beyond-far points are kept. `clipped` is deliberately not used because it includes depth.
    return { x: r.cssX, y: r.cssY, visible: !r.offscreen };
}
