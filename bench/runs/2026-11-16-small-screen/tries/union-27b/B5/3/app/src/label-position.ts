import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Screen position (CSS pixels from the canvas's top-left corner) of a
 * world-space point as seen through `camera`, which renders to `canvas`.
 *
 * `x`/`y` are not clamped: a point in front of the camera but outside the
 * picture reports where it would be, past the edge. `visible` is true only
 * when the point is in front of the camera and inside the picture; points
 * beyond the far plane still count as visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  if (backingWidth <= 0 || backingHeight <= 0) {
    return { x: 0, y: 0, visible: false };
  }

  // The projection must use the aspect the image is actually rendered with:
  // the backing-store size with the camera's viewport taken into account.
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // The camera's picture region in backing pixels (y measured from the top).
  let viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
  let pictureEmpty = false;
  if (viewport.width <= 0 || viewport.height <= 0) {
    // A degenerate viewport would make projectWorldToScreen throw; project
    // through the whole canvas instead and mark nothing as visible.
    pictureEmpty = true;
    viewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };
  }

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
    // With a floating origin the view/projection matrices are camera-relative,
    // so the camera's world position must be supplied as the origin.
    worldOrigin: camera._useFloatingOrigin ? getCameraPosition(camera) : undefined,
  });

  // `clipped` also covers points past the far plane, which we still want to
  // count as visible, so it is deliberately ignored here.
  return {
    x: result.cssX,
    y: result.cssY,
    visible: !pictureEmpty && !result.behindCamera && !result.offscreen,
  };
}
