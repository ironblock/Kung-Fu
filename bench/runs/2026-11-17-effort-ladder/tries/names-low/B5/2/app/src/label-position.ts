import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const w = canvas.width;
  const h = canvas.height;
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;

  const aspect = getEffectiveAspectRatio(camera, w, h);
  const view = getViewMatrix(camera);
  const vp = getViewProjectionMatrix(camera, aspect);
  const viewport = resolveCameraViewport(camera, w, h);

  const result = projectWorldToScreen(point, view, vp, {
    viewport,
    backingWidth: w,
    backingHeight: h,
    cssWidth: cssW,
    cssHeight: cssH,
  });

  return {
    x: result.cssX,
    y: result.cssY,
    visible: !result.behindCamera && !result.offscreen,
  };
}
