import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, type Camera } from "@babylonjs/lite";

/**
 * Project a world-space point to CSS pixels on `canvas`, as seen through `camera`.
 *
 * - `x` / `y`: CSS pixels from the canvas's top-left corner. For points outside the picture
 *   they are the extrapolated position (past the edge), suitable for placing an arrow.
 * - `visible`: the point is in front of the camera and inside the picture. The far clipping
 *   distance is ignored, so distant points still count as visible. Points behind the camera
 *   are never visible; their `x` / `y` are not meaningful.
 *
 * The camera is assumed to render to the whole canvas (its normalized `viewport` is ignored).
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    // Render target size in device pixels. The camera's projection aspect ratio uses this.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Displayed size in CSS pixels. Fall back to the backing size if the canvas is not laid out.
    const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth;
    const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight;

    const aspect = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // With floating origin, the camera's view matrix has no translation: it expects points relative
    // to the camera position. The point must be rebased by the same origin.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    // `offscreen` is set for points behind the camera, for points outside the picture's x/y
    // range, and for non-finite results. It ignores depth, so far-plane clipping does not hide points.
    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: !projected.offscreen,
    };
}
