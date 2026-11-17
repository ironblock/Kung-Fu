import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  getCameraPosition,
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

  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const options = {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  };

  if (camera._useFloatingOrigin) {
    (options as Record<string, unknown>).worldOrigin = getCameraPosition(camera);
  }

  const result = projectWorldToScreen(point, view, viewProjection, options);

  return {
    x: result.cssX,
    y: result.cssY,
    visible: !result.behindCamera && !result.offscreen,
  };
}
