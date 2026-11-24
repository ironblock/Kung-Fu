import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;

  if (
    !Number.isFinite(backingWidth) ||
    !Number.isFinite(backingHeight) ||
    backingWidth <= 0 ||
    backingHeight <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const rect = canvas.getBoundingClientRect();
  const cssWidth = canvas.clientWidth || rect.width || backingWidth;
  const cssHeight = canvas.clientHeight || rect.height || backingHeight;

  if (
    !Number.isFinite(cssWidth) ||
    !Number.isFinite(cssHeight) ||
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  if (
    !Number.isFinite(viewport.x) ||
    !Number.isFinite(viewport.y) ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);

  if (!Number.isFinite(aspect) || aspect <= 0) {
    return { x: 0, y: 0, visible: false };
  }

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);
  const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    worldOrigin,
  });

  const x = Number.isFinite(projected.cssX) ? projected.cssX : 0;
  const y = Number.isFinite(projected.cssY) ? projected.cssY : 0;

  // "clipped" includes points beyond the far plane, which must still be visible.
  const visible = !projected.behindCamera && !projected.offscreen;

  return { x, y, visible };
}
