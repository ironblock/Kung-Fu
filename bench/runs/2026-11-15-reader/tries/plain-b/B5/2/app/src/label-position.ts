import type { Camera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

/**
 * Where a world-space point lands on a canvas that the camera renders to in full.
 *
 * `x` / `y` are CSS pixels from the canvas's top-left corner. They are not clamped, so
 * a point outside the picture still gives its extrapolated position, for example to
 * place an edge arrow. `visible` is true only when the point is in front of the camera,
 * inside the picture laterally, and not nearer than the near clipping plane. Points
 * beyond the far plane still count as visible.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Fall back to backing-pixel units when the canvas has no layout box (e.g. display: none).
    const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth;
    const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight;

    // The render target is the canvas backing store, and the camera fills all of it.
    const aspectRatio = backingWidth / backingHeight;

    // Under floating origin the view matrix is eye-relative, so the point must be rebased the
    // same way the renderer rebases meshes (world minus camera translation).
    const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, aspectRatio), {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    // `offscreen` covers behind-camera, non-finite, and outside-the-picture-laterally cases. It
    // ignores depth, so far-plane distance does not hide a point. Projection is reverse-Z (near
    // maps to 1, far maps to 0), so a depth above 1 means the point is nearer than the near plane.
    const visible = !projected.offscreen && projected.z <= 1;

    return { x: projected.cssX, y: projected.cssY, visible };
}
