import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

export interface LabelPosition {
    x: number;
    y: number;
    visible: boolean;
}

/**
 * Projects a world-space point to CSS pixels on the canvas.
 *
 * `x` / `y` are returned even when the point is off-screen, so they can drive
 * an edge arrow. `visible` is true only when the point is in front of the camera,
 * not closer than the near plane, and inside the canvas. The far plane is
 * deliberately ignored so that distant geometry still counts as visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): LabelPosition {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // The camera renders to the whole canvas, so the viewport covers the backing store.
    const viewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    // Do not use `projected.clipped` or `projected.offscreen`: `clipped` is set by the far
    // plane, which must not hide distant points. Test the CSS coordinates directly instead.
    // With an orthographic camera clipW is not a depth, so the near-plane test is skipped.
    const inFront = !projected.behindCamera;
    const pastNear = camera.ortho ? true : projected.clipW >= camera.nearPlane;
    const insideCanvas =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: inFront && pastNear && insideCanvas,
    };
}
