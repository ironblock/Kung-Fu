import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point lands on a canvas, in CSS pixels from the canvas's
 * top-left corner.
 *
 * `visible` is true only when the point is in front of the camera and inside the
 * canvas rectangle. Depth is deliberately ignored beyond the camera plane, so
 * points past the far clipping distance still count as visible. When the point is
 * off-canvas, `x` and `y` still give its extrapolated position, for edge arrows.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // Under floating-origin (LWR) rendering the matrices are relative to the camera,
    // so the projection needs to know the absolute position of their origin.
    const floatingOrigin = camera._useFloatingOrigin === true;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        ...(floatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
    });

    const x = projected.cssX;
    const y = projected.cssY;
    const finite = Number.isFinite(x) && Number.isFinite(y);
    const inFront = !projected.behindCamera;
    const onCanvas = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: finite && inFront && onCanvas };
}
