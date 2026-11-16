import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's left edge. May lie outside the canvas. */
    x: number;
    /** CSS pixels from the canvas's top edge. May lie outside the canvas. */
    y: number;
    /** In front of the camera and inside the picture, regardless of distance. */
    visible: boolean;
}

/**
 * Projects a world-space point to CSS pixel coordinates on a canvas that the
 * camera renders to in full.
 *
 * The far clipping plane is deliberately ignored: only the w (depth) sign and
 * the x/y bounds decide visibility, so distant points still count as visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): LabelPosition {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Only trust the depth sign and the screen position. The library's
    // `clipped` and `offscreen` flags may fold in far-plane tests, which the
    // spec says must not hide distant points, so they are not used.
    const inFront = !projected.behindCamera && projected.clipW > 0;
    const { cssX: x, cssY: y } = projected;
    const inside = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && inside };
}
