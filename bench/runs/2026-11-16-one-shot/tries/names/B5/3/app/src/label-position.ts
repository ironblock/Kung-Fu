import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  // The camera renders to the whole canvas, so the viewport covers the full backing store.
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  // Layout size in CSS pixels; fall back to the backing size if the canvas is not laid out yet.
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const r = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  const x = r.cssX;
  const y = r.cssY;

  // In front of the camera: not flagged behind, and positive clip w (perspective depth).
  // The library's `clipped` and `offscreen` flags are deliberately ignored: distance
  // beyond the far plane must still count as visible, and the picture bounds are
  // checked here directly.
  const inFront = !r.behindCamera && r.clipW > 0;
  const finite = Number.isFinite(x) && Number.isFinite(y);
  const inside = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

  return { x, y, visible: inFront && finite && inside };
}
