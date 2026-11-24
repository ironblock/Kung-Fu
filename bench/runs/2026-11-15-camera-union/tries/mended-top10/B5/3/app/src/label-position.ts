import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point appears over the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `x`/`y` are returned even when the point is off-picture (for arrows).
 * `visible` is true only when the point is in front of the camera, not closer
 * than the near plane, and inside the picture. Points beyond the far plane
 * still count as visible: the far plane is deliberately ignored here.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  // The camera renders to the whole canvas, so the viewport is the full backing store.
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  // Reverse-Z depth in [0, 1]: 1 at the near plane, 0 at the far plane.
  // Anything above 1 is nearer than the near plane and is clipped by the renderer.
  // Anything below 0 is beyond the far plane, which must not hide the label, so it is not tested.
  const notClippedByNear = result.z <= 1;
  const inFront = !result.behindCamera;
  const inPicture =
    result.cssX >= 0 &&
    result.cssX <= cssWidth &&
    result.cssY >= 0 &&
    result.cssY <= cssHeight;

  return {
    x: result.cssX,
    y: result.cssY,
    visible: inFront && notClippedByNear && inPicture,
  };
}
