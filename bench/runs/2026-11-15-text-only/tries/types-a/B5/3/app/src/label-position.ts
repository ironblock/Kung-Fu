import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas for placing an HTML label.
 *
 * `x`/`y` are CSS pixels from the canvas's top-left corner. They are not clamped, so a
 * point in front of the camera but off-screen still reports where it would be (for an
 * edge arrow). `visible` is true only when the point is in front of the camera and inside
 * the picture. The far clipping plane is deliberately ignored, so distant points count as
 * visible. Points behind the camera are never visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  // The camera renders to the whole canvas, so the viewport is the full backing store.
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, backingWidth / backingHeight);

  // Under floating origin the view matrix is eye-relative (camera at the origin),
  // so the point must be expressed relative to the camera position.
  const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

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
  // `clipped` is not used: it also flags points beyond the far plane, which must count as visible.
  const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;
  const visible = !projected.behindCamera && inPicture;

  return { x, y, visible };
}
