import type { Camera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

/**
 * Where a world-space point lands on a canvas that the camera renders to in full.
 *
 * `x` and `y` are CSS pixels from the canvas's top-left corner. They are extrapolated past the
 * edges for points in front of the camera but outside the picture, so they can drive an arrow.
 * For points behind the camera they are whatever the projection yields and carry no direction.
 *
 * `visible` is true only when the point is in front of the camera, inside the picture, and not
 * nearer than the near plane. Points beyond the far plane still count as visible: this release uses
 * reverse-Z depth, so those points have depth below 0, and the depth test here ignores that side.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    const width = canvas.width;
    const height = canvas.height;
    if (!(width > 0) || !(height > 0)) {
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }

    // The camera renders to the whole backing store, so the viewport is the full canvas and the
    // aspect ratio is the canvas's own. camera.viewport is not consulted.
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, width / height);

    // With floating origin the view matrix has no translation, so the matrices are relative to the
    // camera's position. The point has to be expressed relative to that same position.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
        worldOrigin,
    });

    // Backing pixels to CSS pixels. Fall back to 1:1 when the canvas has no layout box yet.
    const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : width;
    const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : height;
    const x = projected.x * (cssWidth / width);
    const y = projected.y * (cssHeight / height);

    // projected.offscreen and projected.clipped are not used: clipped also flags depth outside [0, 1],
    // which here means beyond the far plane (still visible) or nearer than the near plane (not visible).
    // Only the depth bound that matters is checked.
    const inFront = !projected.behindCamera;
    const inPicture = projected.x >= 0 && projected.x <= width && projected.y >= 0 && projected.y <= height;
    const notNearerThanNearPlane = projected.z <= 1;
    const visible = inFront && inPicture && notNearerThanNearPlane;

    return { x, y, visible };
}
