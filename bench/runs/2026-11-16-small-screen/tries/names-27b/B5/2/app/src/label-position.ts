import type { Camera } from "@babylonjs/lite";
import {
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
  const cssWidth = canvas.clientWidth || canvas.width || 1;
  const cssHeight = canvas.clientHeight || canvas.height || 1;
  const backingWidth = canvas.width || canvas.clientWidth || 1;
  const backingHeight = canvas.height || canvas.clientHeight || 1;

  const rawAspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const aspect =
    Number.isFinite(rawAspect) && rawAspect > 0
      ? rawAspect
      : backingWidth / backingHeight;

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const fullViewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };
  const resolvedViewport = resolveCameraViewport(camera, backingWidth, backingHeight);
  const viewport =
    resolvedViewport &&
    Number.isFinite(resolvedViewport.width) &&
    Number.isFinite(resolvedViewport.height) &&
    resolvedViewport.width > 0 &&
    resolvedViewport.height > 0
      ? resolvedViewport
      : fullViewport;

  const projected = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  const x = Number.isFinite(projected.cssX) ? projected.cssX : 0;
  const y = Number.isFinite(projected.cssY) ? projected.cssY : 0;
  const visible =
    !projected.behindCamera &&
    !projected.offscreen &&
    Number.isFinite(x) &&
    Number.isFinite(y);

  return { x, y, visible };
}
