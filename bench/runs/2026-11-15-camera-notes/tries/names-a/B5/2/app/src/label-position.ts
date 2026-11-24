import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates over the canvas.
 *
 * `x`/`y` are CSS pixels from the canvas top-left, even when the point is
 * off-screen (useful for edge arrows). `visible` is true only when the point
 * is in front of the camera and inside the canvas bounds. Distance is not
 * checked, so points beyond the far plane still count as visible.
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

  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  // `clipped` and `offscreen` are deliberately not used: `clipped` may reflect
  // the far plane, which must not hide distant points. Bounds are checked directly.
  const inFront = !result.behindCamera;
  const inBounds =
    result.cssX >= 0 && result.cssX <= cssWidth && result.cssY >= 0 && result.cssY <= cssHeight;

  return { x: result.cssX, y: result.cssY, visible: inFront && inBounds };
}
