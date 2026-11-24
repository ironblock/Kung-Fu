import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Where a world-space point should be drawn for an HTML label.
 *
 * `x` / `y` are CSS pixels from the canvas's top-left corner. They are
 * extrapolated past the edges for off-screen points (useful for arrows), and
 * are meaningless for points behind the camera.
 *
 * `visible` is true only when the point is in front of the camera and inside
 * the picture. Distance is not checked, so points beyond the far clipping
 * plane still count as visible.
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

    // The camera renders to the whole canvas, so the viewport is the full backing store.
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // With floating origin the matrices are eye-relative, so their zero is the camera position.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    const x = projected.cssX;
    const y = projected.cssY;

    // Deliberately ignores `clipped` (which includes the far plane) and `offscreen`.
    // Only the camera-depth test and the picture rectangle decide visibility.
    const inPicture =
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= 0 &&
        x <= cssWidth &&
        y >= 0 &&
        y <= cssHeight;

    return { x, y, visible: !projected.behindCamera && inPicture };
}
