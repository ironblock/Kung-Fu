import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates on the canvas.
 *
 * - `x`, `y`: where the point lands, relative to the canvas's top-left corner
 *   in CSS pixels. Still meaningful when the point is off-screen (for arrows).
 * - `visible`: the point is in front of the camera and inside the picture.
 *   The far clipping distance is deliberately ignored, so distant points
 *   count as visible. Points behind the camera are never visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  const x = result.cssX;
  const y = result.cssY;

  // Do not use `result.clipped` or `result.offscreen` here: `clipped` would hide
  // points beyond the far plane, which must count as visible. Use the
  // behind-camera flag and the picture bounds instead.
  const inFront = !result.behindCamera;
  const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;
  const finite = Number.isFinite(x) && Number.isFinite(y);

  return { x, y, visible: inFront && inPicture && finite };
}
