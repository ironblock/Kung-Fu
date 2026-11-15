import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point sits on a canvas that the camera renders to in full.
 *
 * x/y are CSS pixels from the canvas's top-left corner, and may lie outside the
 * canvas for points that are in front of the camera but off-screen (for arrows).
 *
 * visible is true when the point is in front of the camera and inside the canvas,
 * regardless of distance. Depth is deliberately ignored: the far clipping plane
 * does not hide points, and the near plane is not used to reject points either.
 * The `clipped` and `offscreen` flags from projectWorldToScreen are not used,
 * since their exact meaning is not documented; visibility is computed here from
 * `behindCamera` and the CSS-pixel bounds instead.
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

    // projectWorldToScreen throws on non-positive sizes, which happens before layout.
    if (!(backingWidth > 0 && backingHeight > 0 && cssWidth > 0 && cssHeight > 0)) {
        return { x: 0, y: 0, visible: false };
    }

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const inPicture =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: !projected.behindCamera && inPicture,
    };
}
