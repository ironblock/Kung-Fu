import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  // CSS size of the canvas; fall back to backing size if it is not laid out yet.
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;
  const aspect = backingWidth / backingHeight;

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  const x = projected.cssX;
  const y = projected.cssY;

  const finite = Number.isFinite(x) && Number.isFinite(y);
  const inFront = !projected.behindCamera;
  // Only the screen rectangle is checked. Depth beyond the far plane is deliberately ignored.
  const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

  return { x, y, visible: finite && inFront && inPicture };
}
