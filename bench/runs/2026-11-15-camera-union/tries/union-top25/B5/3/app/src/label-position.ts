import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `x` and `y` are returned even when the point is off-screen (they may lie
 * past the edge, e.g. for an arrow). `visible` is true only when the point is
 * in front of the camera and inside the picture. Points beyond the far
 * clipping distance are not treated as clipped, so distant geometry counts
 * as visible.
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

  // The camera renders to the whole canvas.
  const viewport = { x: 0, y: 0, width: backingWidth, height: backingHeight };
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const r = projectWorldToScreen(point, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  // Use our own picture-bounds test instead of `offscreen`/`clipped`:
  // `clipped` also fires beyond the far plane, which must still count as
  // visible, and `offscreen` also fires for points behind the camera.
  const inFront = !r.behindCamera;
  const inPicture =
    r.cssX >= 0 && r.cssX <= cssWidth && r.cssY >= 0 && r.cssY <= cssHeight;

  return { x: r.cssX, y: r.cssY, visible: inFront && inPicture };
}
