import {
    getCameraPosition,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas for placing an HTML label.
 *
 * - `x` / `y`: where the point lands, in CSS pixels from the canvas's top-left corner.
 *   For points outside the picture these are still the extrapolated positions, so
 *   they can be used to place an edge arrow.
 * - `visible`: the point is in front of the camera and inside the picture. The far
 *   clipping plane is deliberately ignored, so distant geometry still counts.
 *   A point behind the camera is never visible.
 *
 * The camera is assumed to render to the whole canvas (its normalized viewport, if
 * any, is ignored).
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

    const aspectRatio = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspectRatio);

    // With floating origin (LWR) the view matrix has its translation zeroed, so the
    // matrices are expressed relative to the camera position. Pass that position as
    // the world origin so the projection rebases the point the same way.
    const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    // clipW is the view-space depth for perspective cameras (1 for orthographic), so
    // requiring it to be positive excludes points behind the camera. The library's
    // `clipped` flag is not used because it also trips on the far clipping plane.
    const inFront = !projected.behindCamera && projected.clipW > 0;
    const inPicture =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: inFront && inPicture,
    };
}
