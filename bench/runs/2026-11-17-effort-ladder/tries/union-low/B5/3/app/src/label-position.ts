import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
  getCameraPosition,
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

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  const options: {
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth?: number;
    cssHeight?: number;
    worldOrigin?: { x: number; y: number; z: number };
  } = {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  };

  if (camera._useFloatingOrigin) {
    options.worldOrigin = getCameraPosition(camera);
  }

  const result = projectWorldToScreen(point, view, viewProjection, options);

  // cssX/cssY are in CSS pixels relative to the viewport's top-left.
  // Offset by the viewport position to get canvas-relative coordinates.
  const vx = (viewport.x / backingWidth) * cssWidth;
  const vy = (viewport.y / backingHeight) * cssHeight;

  return {
    x: result.cssX + vx,
    y: result.cssY + vy,
    visible: !result.behindCamera && !result.offscreen,
  };
}
