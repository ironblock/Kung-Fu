import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  type Camera,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears on a canvas that the camera renders to in full.
 *
 * Returns CSS-pixel coordinates from the canvas's top-left corner. `visible` is true
 * when the point is in front of the camera and inside the picture, regardless of
 * distance from the camera. Points beyond the far plane are not culled here.
 * Points in front of the camera but outside the picture still get their (off-edge)
 * x/y, so they can be used to place an arrow.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  // projectWorldToScreen throws unless the CSS size is positive; a canvas that is not
  // laid out has no meaningful CSS position, so report it as not visible.
  if (!(cssWidth > 0 && cssHeight > 0)) {
    return { x: NaN, y: NaN, visible: false };
  }

  const backingWidth = canvas.width;
  const backingHeight = canvas.height;

  // The camera renders to the whole canvas, so the viewport is the full backing size and
  // the aspect ratio is the canvas's own (camera.viewport is intentionally not applied).
  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const options = {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
    // On a floating-origin camera the view matrix has no translation, so the
    // absolute point must be taken relative to the camera position.
    ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
  };

  const r = projectWorldToScreen(point, view, viewProjection, options);

  // `offscreen` covers behind-camera and x/y outside the picture; it ignores depth,
  // so far-away points are not rejected. `clipped` is deliberately not used because
  // it also flags points beyond the far plane. NaN results (degenerate clipW) are
  // treated as not visible.
  const visible =
    !r.behindCamera &&
    !r.offscreen &&
    Number.isFinite(r.cssX) &&
    Number.isFinite(r.cssY);

  return { x: r.cssX, y: r.cssY, visible };
}
