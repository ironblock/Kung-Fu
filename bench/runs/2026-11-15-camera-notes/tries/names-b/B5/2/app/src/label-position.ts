import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates on the canvas.
 *
 * - `x`, `y`: CSS pixels from the canvas's top-left corner. For points outside
 *   the picture (or behind the camera) they still give the projected location,
 *   which can be past the edge; for points behind the camera they are not meaningful.
 * - `visible`: true only when the point is in front of the camera and inside the
 *   canvas. The far clipping distance is deliberately ignored, so distant points
 *   count as visible. Depth (`clipW`) does not depend on the far plane, and the
 *   screen position does not either, so this is safe.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);

    const projected = projectWorldToScreen(
        point,
        getViewMatrix(camera),
        getViewProjectionMatrix(camera, aspect),
        {
            viewport: resolveCameraViewport(camera, canvas.width, canvas.height),
            backingWidth: canvas.width,
            backingHeight: canvas.height,
            cssWidth,
            cssHeight,
        },
    );

    // clipW is the view-space depth for a perspective projection: positive means in front.
    const inFront = projected.clipW > 0;
    const inPicture =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return { x: projected.cssX, y: projected.cssY, visible: inFront && inPicture };
}
