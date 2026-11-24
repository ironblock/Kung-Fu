import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `x`/`y` are returned even when the point is not visible, so they can drive an
 * off-screen arrow. `visible` is true only when the point is in front of the
 * camera (clip-space w > 0) and inside the picture. The far clipping distance is
 * deliberately ignored: distant geometry beyond `farPlane` still counts as
 * visible. Depth (`z`) is not used at all.
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

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    // The library's own `clipped`, `offscreen` and `behindCamera` flags are not
    // used: their exact rules (in particular for depth) are not documented, and
    // the far-plane rule must not apply. Visibility is decided from clipW and
    // the CSS-pixel position below.
    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    });

    const inFront = projected.clipW > 0;
    const inside =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: inFront && inside,
    };
}
