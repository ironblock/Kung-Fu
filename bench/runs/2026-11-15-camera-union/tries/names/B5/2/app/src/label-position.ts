import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates over a canvas whose
 * whole area is rendered by `camera`.
 *
 * `x`/`y` are CSS pixels from the canvas top-left and are not clamped, so
 * off-screen points still give a direction for an edge arrow.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. The far clipping distance is deliberately ignored, so distant
 * points still count as visible. A point behind the camera is never visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(
    camera,
    backingWidth / backingHeight
  );

  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  // Use only the behind-camera flag and our own bounds test. The library's
  // `clipped` flag is not used because it may reflect the far plane.
  const insidePicture =
    projected.cssX >= 0 &&
    projected.cssX <= cssWidth &&
    projected.cssY >= 0 &&
    projected.cssY <= cssHeight;

  return {
    x: projected.cssX,
    y: projected.cssY,
    visible: !projected.behindCamera && insidePicture,
  };
}
