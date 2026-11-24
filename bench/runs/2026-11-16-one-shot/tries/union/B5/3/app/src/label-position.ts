import {
  getCameraPosition,
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

  // Not laid out yet: projection would throw on non-positive sizes.
  if (!(backingWidth > 0 && backingHeight > 0 && cssWidth > 0 && cssHeight > 0)) {
    return { x: 0, y: 0, visible: false };
  }

  // The camera renders to the whole canvas, so the aspect is the canvas aspect.
  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const r = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    // With a floating origin the view matrix is camera-relative, so the
    // projection needs the camera's world position as its origin.
    ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
  });

  // Only the picture bounds and the front/behind test decide visibility.
  // Far-plane clipping is deliberately ignored, so distant points still count.
  // z is 1 at the near plane (reverse-Z), so anything closer than that is out of the picture.
  const inFront = !r.behindCamera;
  const inPicture =
    r.cssX >= 0 && r.cssX <= cssWidth && r.cssY >= 0 && r.cssY <= cssHeight;
  const notInsideNear = !(r.z > 1);

  return {
    x: r.cssX,
    y: r.cssY,
    visible: inFront && inPicture && notInsideNear,
  };
}
