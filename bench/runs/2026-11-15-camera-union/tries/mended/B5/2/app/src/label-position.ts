import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  type Camera,
} from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `x`/`y` are returned even when the point is off-screen (past an edge), so
 * they can drive an arrow. `visible` is true only when the point is in front
 * of the camera and inside the picture. The far clipping distance is ignored
 * on purpose, so distant points still count as visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  // projectWorldToScreen throws on zero-size viewports (e.g. canvas not laid out yet).
  if (backingWidth <= 0 || backingHeight <= 0 || cssWidth <= 0 || cssHeight <= 0) {
    return { x: 0, y: 0, visible: false };
  }

  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const r = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  // Depth is checked only for "in front of the eye". The far plane is not checked.
  const inFront = r.clipW > 0 && !r.behindCamera;
  const inPicture =
    r.cssX >= 0 && r.cssX <= cssWidth && r.cssY >= 0 && r.cssY <= cssHeight;

  return { x: r.cssX, y: r.cssY, visible: inFront && inPicture };
}
