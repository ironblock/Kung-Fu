import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's left edge. May lie outside the canvas. */
    x: number;
    /** CSS pixels from the canvas's top edge. May lie outside the canvas. */
    y: number;
    /** In front of the camera and inside the canvas, at any distance. */
    visible: boolean;
}

/**
 * Projects a world-space point to CSS pixels on a canvas the camera fills.
 *
 * The far clipping plane is ignored on purpose: points beyond `camera.farPlane`
 * still count as visible. The library's `clipped` and `offscreen` flags are also
 * ignored, since they may include depth clipping. Visibility is decided here from
 * the homogeneous w (positive means in front of the camera) and from the
 * CSS-pixel bounds of the canvas.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): LabelPosition {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth || canvas.width;
    const cssHeight = canvas.clientHeight || canvas.height;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const x = projected.cssX;
    const y = projected.cssY;
    const inFront = projected.clipW > 0 && Number.isFinite(x) && Number.isFinite(y);
    const inside = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && inside };
}
