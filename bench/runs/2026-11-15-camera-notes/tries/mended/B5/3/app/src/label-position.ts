import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas.
 *
 * - `x`, `y`: where the point appears, in CSS pixels from the canvas's top-left
 *   corner. Off-screen points keep their unclamped position (for arrows).
 * - `visible`: the point is in front of the camera and inside the picture.
 *   Depth is ignored on purpose, so points beyond the far clipping distance
 *   still count as visible.
 *
 * Assumes the camera renders to the whole canvas (camera.viewport is not used).
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    // Backing-store size in device pixels (what the projection works in).
    const width = canvas.width;
    const height = canvas.height;
    if (!(width > 0 && height > 0)) {
        // projectWorldToScreen throws on non-positive sizes; the canvas has no area yet.
        return { x: 0, y: 0, visible: false };
    }

    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, width / height);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
    });

    // Backing pixels -> CSS pixels.
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const x = projected.x * (cssWidth / width);
    const y = projected.y * (cssHeight / height);

    const inFront = !projected.behindCamera && projected.clipW > 0;
    const inPicture =
        Number.isFinite(projected.x) &&
        Number.isFinite(projected.y) &&
        projected.x >= 0 &&
        projected.x <= width &&
        projected.y >= 0 &&
        projected.y <= height;

    return { x, y, visible: inFront && inPicture };
}
