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
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  if (
    !Number.isFinite(cssWidth) ||
    !Number.isFinite(cssHeight) ||
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const aspect = getEffectiveAspectRatio(camera, cssWidth, cssHeight);
  const viewport = resolveCameraViewport(camera, cssWidth, cssHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth: canvas.width || cssWidth,
    backingHeight: canvas.height || cssHeight,
    cssWidth,
    cssHeight,
  });

  if (
    projected.behindCamera ||
    !Number.isFinite(projected.cssX) ||
    !Number.isFinite(projected.cssY)
  ) {
    return { x: 0, y: 0, visible: false };
  }

  // Intentionally ignore `clipped` so points beyond the far plane still count as visible.
  const visible = !projected.offscreen;

  return {
    x: projected.cssX,
    y: projected.cssY,
    visible,
  };
}
