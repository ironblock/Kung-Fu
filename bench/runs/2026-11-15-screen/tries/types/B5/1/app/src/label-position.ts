import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas.
 *
 * - `x` / `y`: position in CSS pixels from the canvas's top-left corner. These
 *   may lie outside the canvas, so they can be used to place an edge arrow.
 * - `visible`: the point is in front of the camera and inside the canvas. The
 *   far clipping plane is ignored, so distant points still count as visible.
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

  if (backingWidth === 0 || backingHeight === 0 || cssWidth === 0 || cssHeight === 0) {
    return { x: 0, y: 0, visible: false };
  }

  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // With floating origin enabled, the view matrix is relative to the camera
  // position, so the point must be expressed relative to that same origin.
  const floatingOrigin = camera._useFloatingOrigin === true;
  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    ...(floatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
  });

  const x = projected.cssX;
  const y = projected.cssY;

  // Use only behindCamera and our own bounds check. `clipped` is true beyond
  // the far plane, which would wrongly hide distant points, and `offscreen`
  // is not documented clearly enough to rely on.
  const inFront = !projected.behindCamera;
  const insidePicture =
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    x <= cssWidth &&
    y >= 0 &&
    y <= cssHeight;

  return { x, y, visible: inFront && insidePicture };
}
