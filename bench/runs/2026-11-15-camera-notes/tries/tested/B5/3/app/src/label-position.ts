import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. The far clipping distance is ignored on purpose, so distant points
 * still count as visible. Points behind the camera are never visible. For a
 * point in front of the camera but outside the picture, `x` and `y` still give
 * the position past the edge, for use with an arrow.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const width = canvas.width;
    const height = canvas.height;
    if (!(width > 0) || !(height > 0)) {
        // projectWorldToScreen throws RangeError for a non-positive backing size.
        return { x: 0, y: 0, visible: false };
    }

    // The camera renders to the whole canvas, so the viewport is the full backing store.
    const aspect = getEffectiveAspectRatio(camera, width, height);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const r = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
    });

    // Backing pixels -> CSS pixels. Fall back to 1:1 if the canvas is not laid out.
    const cssWidth = canvas.clientWidth || width;
    const cssHeight = canvas.clientHeight || height;
    const x = r.x * (cssWidth / width);
    const y = r.y * (cssHeight / height);

    // Deliberately not using r.clipped or r.offscreen: clipped also covers the
    // far plane, and offscreen's exact meaning is not documented.
    const inFront = !r.behindCamera;
    const inPicture = r.x >= 0 && r.x < width && r.y >= 0 && r.y < height;
    const finite = Number.isFinite(x) && Number.isFinite(y);

    return { x, y, visible: inFront && inPicture && finite };
}
