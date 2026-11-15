import {
    getCameraPosition,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreenToRef,
} from "@babylonjs/lite";
import type { Camera, ScreenProjectionResult } from "@babylonjs/lite";

const scratch: ScreenProjectionResult = {
    x: 0,
    y: 0,
    z: 0,
    cssX: 0,
    cssY: 0,
    clipW: 0,
    behindCamera: false,
    clipped: false,
    offscreen: false,
};

/**
 * Where a world-space point lands on a canvas that the camera renders to in full.
 *
 * `x`/`y` are CSS pixels from the canvas's top-left corner. They are extrapolated past the
 * edges for points in front of the camera but outside the picture, so they can drive an arrow.
 * `visible` is true when the point is in front of the camera and inside the picture. Depth is
 * ignored: points beyond the far plane still count as visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const width = canvas.width;
    const height = canvas.height;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, width / height);

    // Under floating origin the view matrix has no translation; it is relative to the camera.
    // Subtract the camera position from the point so both paths use the same frame.
    const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

    projectWorldToScreenToRef(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
        worldOrigin,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    }, scratch);

    // `offscreen` covers behind-camera, non-positive clip W and the picture rectangle. It does not
    // include the depth range, which `clipped` would wrongly test against the far plane.
    return { x: scratch.cssX, y: scratch.cssY, visible: !scratch.offscreen };
}
