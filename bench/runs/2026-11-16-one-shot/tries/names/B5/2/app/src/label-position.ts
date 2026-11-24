import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // The camera renders to the whole canvas, so the viewport covers the full backing buffer.
  const r = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  const x = r.cssX;
  const y = r.cssY;
  const finite = Number.isFinite(x) && Number.isFinite(y);
  // Only the sign of clipW and behindCamera decide "in front"; far-plane clipping is ignored.
  const inFront = !r.behindCamera && r.clipW > 0;
  const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

  return { x, y, visible: finite && inFront && inPicture };
}
