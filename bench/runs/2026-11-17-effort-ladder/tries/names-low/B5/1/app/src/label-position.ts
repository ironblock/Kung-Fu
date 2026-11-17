import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const aspectRatio = getEffectiveAspectRatio(camera, cssWidth, cssHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspectRatio);

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    backingWidth: canvas.width,
    backingHeight: canvas.height,
    cssWidth,
    cssHeight,
  });

  return {
    x: result.cssX,
    y: result.cssY,
    visible: !result.behindCamera && !result.offscreen,
  };
}
