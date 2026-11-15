import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/** Where a world-space point lands on the canvas, in CSS pixels from the canvas's top-left corner.
 *  `visible` is true when the point is in front of the camera and inside the picture; distance
 *  beyond the far plane does not count against it. Points behind the camera are never visible. */
export interface LabelPosition {
    x: number;
    y: number;
    visible: boolean;
}

/** Project a world-space point to HTML label coordinates for a camera that renders to the whole canvas.
 *
 *  Uses the library's `projectWorldToScreen`, which classifies with `offscreen` (behind the camera,
 *  negative clip W, or outside the X/Y clip range). Depth is intentionally ignored, so far-away points
 *  stay visible. Off-screen points keep their extrapolated position, which is useful for edge arrows. */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): LabelPosition {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    if (!(backingWidth > 0 && backingHeight > 0)) {
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }
    // The label layer is positioned in CSS pixels; fall back to the backing size when the canvas is not laid out.
    const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth;
    const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight;

    // The camera renders to the whole canvas, so the camera's normalized viewport is ignored here.
    const aspectRatio = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspectRatio);

    // With floating origin the view matrix has no translation, so the point must be made relative to the camera.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    return { x: result.cssX, y: result.cssY, visible: !result.offscreen };
}
