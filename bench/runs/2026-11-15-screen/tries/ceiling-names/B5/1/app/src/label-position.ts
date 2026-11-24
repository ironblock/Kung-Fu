import type { Camera } from "@babylonjs/lite";
import { getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner, for placing an HTML label over the 3D view.
 *
 * Assumes the camera renders to the whole canvas.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture, at any distance (points beyond the far clipping plane still count).
 * Points in front of the camera but outside the picture are not visible, but
 * `x`/`y` still give where they would be, past the edge. Points behind the
 * camera are never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // Size of the drawing buffer (what the camera renders into) and the size
    // the canvas is laid out at on the page (what labels are positioned in).
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // No picture (zero-sized buffer, or canvas not laid out): nothing is visible.
    if (backingWidth <= 0 || backingHeight <= 0 || cssWidth <= 0 || cssHeight <= 0) {
        return { x: 0, y: 0, visible: false };
    }

    // Same matrices the renderer uses for a camera filling the whole canvas.
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, backingWidth / backingHeight);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const x = projected.cssX;
    const y = projected.cssY;

    // In front of the camera. The library's `clipped` / `offscreen` flags are
    // deliberately not used: they may also reflect the near/far depth range,
    // and distant points beyond the far plane must still count as visible.
    const inFront = !projected.behindCamera && projected.clipW > 0;

    // Inside the picture, judged only by the on-screen position.
    const insidePicture =
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= 0 &&
        x <= cssWidth &&
        y >= 0 &&
        y <= cssHeight;

    return { x, y, visible: inFront && insidePicture };
}
