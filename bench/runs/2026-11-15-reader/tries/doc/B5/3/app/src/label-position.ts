import type { Camera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, type ScreenProjectionOptions } from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the canvas's
 * top-left corner. `visible` is true when the point is in front of the camera and
 * inside the picture. Points beyond the far plane are not clipped by this check.
 * Points outside the picture still get their extrapolated `x`/`y`, for edge arrows.
 * Points behind the camera are never visible.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;

    // The camera renders to the whole canvas, so use the full canvas as the viewport and
    // the raw canvas aspect ratio, ignoring any camera.viewport.
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, backingWidth / backingHeight);

    // With floating origin the matrices are eye-relative, so the point must be rebased
    // by the camera position (the same offset the engine uses).
    const options: ScreenProjectionOptions = {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        // If the canvas is not laid out (for example display: none), there is no CSS size to
        // map to, so fall back to backing pixels rather than throwing inside a render loop.
        cssWidth: canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth,
        cssHeight: canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight,
        worldOrigin: camera._useFloatingOrigin ? getCameraPosition(camera) : undefined,
    };

    const projected = projectWorldToScreen(point, view, viewProjection, options);
    return {
        x: projected.cssX,
        y: projected.cssY,
        // `offscreen` covers behind-camera, negative clip W and out-of-picture XY, and
        // ignores depth, so far-away points stay visible.
        visible: !projected.offscreen,
    };
}
