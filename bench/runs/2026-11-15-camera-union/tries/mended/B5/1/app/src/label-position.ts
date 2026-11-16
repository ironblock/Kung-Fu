import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates over a canvas that the
 * camera renders to in full.
 *
 * - `x`, `y`: where the point lands, in CSS pixels from the canvas's top-left
 *   corner. Not clamped, so a point off the side gives a position past the edge.
 * - `visible`: the point is in front of the camera and inside the canvas. The
 *   far clipping distance and the near-plane depth are deliberately ignored.
 *   A point behind the camera is never visible.
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

  // projectWorldToScreen throws RangeError on zero-size viewports, which happen
  // before the canvas has been laid out. Nothing can be shown then.
  if (backingWidth <= 0 || backingHeight <= 0 || cssWidth <= 0 || cssHeight <= 0) {
    return { x: 0, y: 0, visible: false };
  }

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

  // Decide visibility here rather than from `clipped` or `offscreen`: with
  // reverse-Z, `clipped` is set beyond the far plane, and `offscreen` is also
  // set for points behind the camera.
  const inFront = !result.behindCamera && result.clipW > 0;
  const inside =
    result.cssX >= 0 &&
    result.cssX <= cssWidth &&
    result.cssY >= 0 &&
    result.cssY <= cssHeight;

  return { x: result.cssX, y: result.cssY, visible: inFront && inside };
}
