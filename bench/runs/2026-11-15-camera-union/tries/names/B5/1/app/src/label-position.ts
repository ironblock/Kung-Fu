import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point onto the canvas for placing an HTML label.
 *
 * x/y are CSS pixels from the canvas's top-left corner. They are still
 * computed for points outside the picture or behind the camera, so callers
 * can place an off-screen arrow. `visible` is true only when the point is in
 * front of the camera and inside the picture. Distance to the far plane is
 * deliberately ignored, so distant geometry beyond farPlane still counts.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // The camera renders to the whole canvas.
    const viewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const r = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const inFront = !r.behindCamera;
    const inPicture =
        r.cssX >= 0 && r.cssX <= cssWidth && r.cssY >= 0 && r.cssY <= cssHeight;

    return {
        x: r.cssX,
        y: r.cssY,
        visible: inFront && inPicture && Number.isFinite(r.cssX) && Number.isFinite(r.cssY),
    };
}
