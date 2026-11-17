import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

function finiteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  // Prefer CSS layout size, but fall back to the canvas backing size when no
  // CSS layout information is available.
  const cssWidth = canvas.clientWidth || canvas.getBoundingClientRect().width || canvas.width || 0;
  const cssHeight = canvas.clientHeight || canvas.getBoundingClientRect().height || canvas.height || 0;
  const backingWidth = canvas.width || cssWidth || 0;
  const backingHeight = canvas.height || cssHeight || 0;

  if (cssWidth <= 0 || cssHeight <= 0 || backingWidth <= 0 || backingHeight <= 0) {
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

  let aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  if (!Number.isFinite(aspect) || aspect <= 0) {
    aspect = viewport.width / viewport.height;
  }

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const projectionOptions = {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
  };

  const projected = projectWorldToScreen(point, view, viewProjection, projectionOptions);

  const x = finiteNumber(projected.cssX, 0);
  const y = finiteNumber(projected.cssY, 0);

  // Visible means: in front of the camera and inside the picture.
  // Ignore projected.clipped so points beyond the far plane can still be visible.
  const clipInFront = Number.isFinite(projected.clipW) ? projected.clipW > 0 : true;
  const finiteCss = Number.isFinite(projected.cssX) && Number.isFinite(projected.cssY);
  const visible = !projected.behindCamera && clipInFront && !projected.offscreen && finiteCss;

  return { x, y, visible };
}
