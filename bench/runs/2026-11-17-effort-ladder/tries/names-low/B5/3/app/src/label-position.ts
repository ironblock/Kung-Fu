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
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  const aspectRatio = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspectRatio);
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  return {
    x: result.cssX,
    y: result.cssY,
    visible: !result.behindCamera && !result.offscreen,
  };
}
