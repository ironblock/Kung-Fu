import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  // Backing-store size (drawing buffer) and CSS size of the canvas.
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  // projectWorldToScreen throws RangeError on non-positive sizes,
  // which happens before the canvas has been laid out.
  if (!(backingWidth > 0 && backingHeight > 0 && cssWidth > 0 && cssHeight > 0)) {
    return { x: 0, y: 0, visible: false };
  }

  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // With a floating origin the view matrix has no translation, so the
  // projection needs the camera's world position as the origin.
  const floatingOrigin = camera._useFloatingOrigin === true;

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    ...(floatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
  });

  // Far-plane clipping is not a reason to hide a point, and offscreen is
  // not set for it. Behind-camera points are never visible.
  return {
    x: result.cssX,
    y: result.cssY,
    visible: !result.behindCamera && !result.offscreen,
  };
}
