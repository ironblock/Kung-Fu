import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  if (!(backingWidth > 0) || !(backingHeight > 0)) {
    return { x: 0, y: 0, visible: false };
  }

  const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth;
  const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight;

  // Match the aspect the camera is rendered with.
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // With a floating origin the view matrix is camera-relative, so the
  // world point must be offset by the camera position.
  const floating = camera._useFloatingOrigin === true;

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    ...(floating ? { worldOrigin: getCameraPosition(camera) } : {}),
  });

  const x = result.cssX;
  const y = result.cssY;

  // Ignore the far-plane clip flag on purpose: distant points still count.
  // A point behind the camera is never visible.
  const inFront = !result.behindCamera;
  const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

  return { x, y, visible: inFront && inPicture };
}
