import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Project a world-space point to CSS pixels on a canvas that the camera renders
 * to in full.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * canvas rectangle. The far clip plane is ignored on purpose: distant points
 * still count as visible. `x` and `y` are returned even when the point is off
 * screen or behind the camera, so callers can place an edge arrow.
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

  // Not laid out or not sized yet: no meaningful projection is possible.
  if (!(backingWidth > 0 && backingHeight > 0 && cssWidth > 0 && cssHeight > 0)) {
    return { x: 0, y: 0, visible: false };
  }

  // With floating origin the view matrix has its translation zeroed, so the
  // matrices are relative to the camera position and that position must be
  // passed as worldOrigin. Otherwise the matrices are absolute world matrices.
  const floatingOrigin = camera._useFloatingOrigin === true;

  const projected = projectWorldToScreen(
    point,
    getViewMatrix(camera),
    getViewProjectionMatrix(camera, backingWidth / backingHeight),
    {
      viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
      ...(floatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
    },
  );

  const x = projected.cssX;
  const y = projected.cssY;

  // Do not use `clipped` or `offscreen`: `clipped` includes the far plane,
  // which would hide distant points. Test depth and the 2D rectangle directly.
  const inFront = !projected.behindCamera && projected.clipW > 0;
  const finite = Number.isFinite(x) && Number.isFinite(y);
  const inside = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

  return { x, y, visible: finite && inFront && inside };
}
