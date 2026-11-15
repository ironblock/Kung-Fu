import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates over a canvas that the
 * camera renders to in full.
 *
 * `x` / `y` are CSS pixels from the canvas's top-left corner. They are not
 * clamped, so a point off-screen still reports where it would be (useful for
 * edge arrows). `visible` is true only when the point is in front of the camera
 * and inside the canvas rectangle. The far clipping plane is deliberately
 * ignored, so distant points still count as visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  // Fall back to the backing size if the canvas has no layout box yet.
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;

  // The camera renders to the whole canvas, so use the full backing store as
  // the viewport and its aspect ratio, ignoring any camera.viewport.
  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // With floating origin, the matrices are relative to the camera position,
  // so the point has to be rebased onto that same origin.
  const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    ...(worldOrigin !== undefined ? { worldOrigin } : {}),
  });

  const x = projected.cssX;
  const y = projected.cssY;
  // Do not use `projected.clipped` or `projected.offscreen`: `clipped` includes
  // the far plane, and `offscreen` is not a plain in-rectangle test.
  const inPicture =
    Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;
  const visible = !projected.behindCamera && inPicture;

  return { x, y, visible };
}
