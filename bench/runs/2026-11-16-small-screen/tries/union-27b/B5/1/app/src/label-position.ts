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

  const rect =
    typeof canvas.getBoundingClientRect === "function"
      ? canvas.getBoundingClientRect()
      : undefined;

  const cssWidth = canvas.clientWidth || rect?.width || canvas.width;
  const cssHeight = canvas.clientHeight || rect?.height || canvas.height;

  if (
    !Number.isFinite(backingWidth) ||
    backingWidth <= 0 ||
    !Number.isFinite(backingHeight) ||
    backingHeight <= 0 ||
    !Number.isFinite(cssWidth) ||
    cssWidth <= 0 ||
    !Number.isFinite(cssHeight) ||
    cssHeight <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  if (
    !Number.isFinite(viewport.x) ||
    !Number.isFinite(viewport.y) ||
    !Number.isFinite(viewport.width) ||
    viewport.width <= 0 ||
    !Number.isFinite(viewport.height) ||
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

  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    worldOrigin: camera._useFloatingOrigin ? getCameraPosition(camera) : undefined,
  });

  const finite = Number.isFinite(projected.cssX) && Number.isFinite(projected.cssY);

  return {
    x: finite ? projected.cssX : 0,
    y: finite ? projected.cssY : 0,
    visible: finite && !projected.behindCamera && !projected.offscreen,
  };
}
