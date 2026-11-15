import {
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
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  // Do not use result.clipped or result.offscreen: they are derived from depth,
  // so they would reject points beyond the far plane, which must count as visible.
  // Decide front/behind from the clip w and the behind flag, and decide the picture
  // bounds from the CSS coordinates alone.
  const inFront = !result.behindCamera && result.clipW > 0;
  const inPicture =
    result.cssX >= 0 &&
    result.cssX <= cssWidth &&
    result.cssY >= 0 &&
    result.cssY <= cssHeight;

  return {
    x: result.cssX,
    y: result.cssY,
    visible: inFront && inPicture,
  };
}
