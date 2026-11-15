import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Project a world-space point to canvas CSS pixels for placing an HTML label.
 *
 * `x` and `y` are CSS pixels from the canvas's top-left corner, even when the
 * point lies outside the picture (useful for edge arrows). `visible` is true
 * only when the point is in front of the camera and inside the picture. The
 * far clipping plane is deliberately ignored, so distant points still count.
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

  if (!(backingWidth > 0 && backingHeight > 0 && cssWidth > 0 && cssHeight > 0)) {
    return { x: NaN, y: NaN, visible: false };
  }

  // The camera renders to the whole canvas, so the viewport is the full backing store.
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  // Under floating origin the view matrix is eye-relative, so the point must be
  // expressed relative to the camera position.
  const worldOrigin = camera._useFloatingOrigin === true ? getCameraPosition(camera) : undefined;

  const r = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    ...(worldOrigin ? { worldOrigin } : {}),
  });

  // `clipped` (near/far clip planes) and `offscreen` are not used: far-away
  // points must count as visible, and the picture bounds are checked directly.
  const finite = Number.isFinite(r.cssX) && Number.isFinite(r.cssY);
  const inFront = !r.behindCamera && r.clipW > 0;
  const inPicture =
    r.cssX >= 0 && r.cssX <= cssWidth && r.cssY >= 0 && r.cssY <= cssHeight;

  return { x: r.cssX, y: r.cssY, visible: finite && inFront && inPicture };
}
