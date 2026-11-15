import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

export interface LabelPosition {
    x: number;
    y: number;
    visible: boolean;
}

/**
 * Projects a world-space point to CSS pixels relative to the canvas's top-left corner.
 *
 * - `visible` is true when the point is in front of the camera (positive clip-space w)
 *   and inside the canvas. Depth is not checked against the far plane, so distant
 *   points count as visible.
 * - `x`/`y` are returned even when the point is off-screen, so callers can place an arrow.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): LabelPosition {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Fall back to the backing size if the canvas has no layout box yet.
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Use only the w component for "in front of the camera". The library's
    // `clipped`, `offscreen` and `behindCamera` flags are not relied on because
    // their exact meaning is not documented in the declarations.
    const inFront = result.clipW > 0;
    const x = result.cssX;
    const y = result.cssY;
    const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && inPicture };
}
