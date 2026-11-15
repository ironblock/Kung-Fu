import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    getCameraPosition,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. Distance is ignored: points beyond the far clipping plane (or
 * closer than the near plane) still count as visible. For points in front of
 * the camera but outside the picture, `x`/`y` still give the off-canvas
 * position (useful for edge arrows). Points behind the camera are never
 * visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth || backingWidth;
    const cssHeight = canvas.clientHeight || backingHeight;

    // The camera renders to the whole canvas.
    const viewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);

    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        // Cameras using a floating origin render relative to their own position.
        worldOrigin: camera._useFloatingOrigin ? getCameraPosition(camera) : undefined,
    });

    const x = result.cssX;
    const y = result.cssY;

    // Decide visibility ourselves rather than via `clipped`/`offscreen`, which
    // may also account for the near/far depth range. Only "in front of the
    // camera" and "inside the picture" matter here.
    const inFront = !result.behindCamera;
    const inside =
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= 0 &&
        x <= cssWidth &&
        y >= 0 &&
        y <= cssHeight;

    return { x, y, visible: inFront && inside };
}
