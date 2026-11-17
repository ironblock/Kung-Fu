import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  projectWorldToScreen,
  resolveCameraViewport,
  getCameraPosition,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  const viewport = resolveCameraViewport(camera, cssWidth, cssHeight);
  const aspect = getEffectiveAspectRatio(camera, cssWidth, cssHeight);

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const options: {
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    worldOrigin?: { x: number; y: number; z: number };
  } = {
    viewport,
    backingWidth: canvas.width,
    backingHeight: canvas.height,
    cssWidth,
    cssHeight,
  };

  if (camera._useFloatingOrigin) {
    options.worldOrigin = getCameraPosition(camera);
  }

  const result = projectWorldToScreen(point, view, viewProjection, options);

  return {
    x: result.cssX,
    y: result.cssY,
    visible: !result.behindCamera && !result.offscreen,
  };
}
