import {
    getCameraPosition,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreenToRef,
    type Camera,
    type ScreenProjectionOptions,
    type ScreenProjectionResult,
} from "@babylonjs/lite";

/**
 * Where a world-space point sits on a canvas that the camera renders to in full.
 *
 * `x` / `y` are CSS pixels from the canvas's top-left corner. They are finite for any point
 * in front of the camera, including points outside the picture, so they can drive an edge arrow.
 *
 * `visible` is true when the point is in front of the camera, inside the picture, and not nearer
 * than the near plane. The far plane is ignored, so distant points count as visible. A point
 * behind the camera is never visible.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    if (!(backingWidth > 0) || !(backingHeight > 0)) {
        // Canvas not sized yet: nothing can be placed.
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }

    // The camera renders to the whole canvas, so the aspect ratio and viewport are the canvas's own.
    const aspect = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const options: ScreenProjectionOptions = {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        // With floating origin the view matrix is relative to the camera position, so the point must be too.
        ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
        ...(cssWidth > 0 && cssHeight > 0 ? { cssWidth, cssHeight } : {}),
    };

    const result: ScreenProjectionResult = {
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
    projectWorldToScreenToRef(point, view, viewProjection, options, result);

    // `offscreen` covers: behind the camera, negative clip W, outside the NDC x/y range, and non-finite results.
    // `result.clipped` is NOT used: it also flags depth beyond the far plane, which must count as visible.
    // Reverse-Z depth: near maps to 1 and far maps to 0, so z > 1 means nearer than the near plane.
    const visible = !result.offscreen && result.z <= 1;
    return { x: result.cssX, y: result.cssY, visible };
}
