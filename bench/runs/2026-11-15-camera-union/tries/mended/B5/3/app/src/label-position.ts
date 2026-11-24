import {
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    type Camera,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears over a canvas that the camera renders to in full.
 *
 * x/y are CSS pixels from the canvas's top-left corner, y growing downwards. They are
 * not clamped, so a point off the side of the picture gives a position past the edge.
 *
 * visible is true when the point is in front of the camera and inside the picture.
 * The far clipping distance is ignored on purpose: a point beyond farPlane is still visible.
 * A point behind the camera is never visible.
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

    // The camera renders to the whole canvas, so the projection viewport is the full backing buffer.
    const aspect = backingWidth / backingHeight;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const screen = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const x = screen.cssX;
    const y = screen.cssY;
    // `clipped` is deliberately not used: it is also set for points beyond farPlane, which must stay visible.
    // `offscreen` is not used either, so the picture bounds are checked here directly.
    const inFront = !screen.behindCamera;
    const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

    return { x, y, visible: inFront && inPicture };
}
