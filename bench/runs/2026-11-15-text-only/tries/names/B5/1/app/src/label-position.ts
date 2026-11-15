import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS-pixel coordinates over a canvas that the
 * camera renders to in full.
 *
 * - `x`, `y`: where the point lands in CSS pixels from the canvas top-left.
 *   Not clamped, so a point off the picture yields coordinates past the edge.
 * - `visible`: the point is in front of the camera (clip w > 0) and inside the
 *   picture rectangle. Far-plane distance is deliberately ignored, so points
 *   beyond `farPlane` can still be visible. The library's own `clipped` and
 *   `offscreen` flags are not used for this reason.
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

  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;

  // The camera renders to the whole canvas, so the aspect ratio is the canvas's own.
  const aspect = backingWidth / backingHeight;
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const result = projectWorldToScreen(point, view, viewProjection, {
    viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });

  const x = result.cssX;
  const y = result.cssY;
  const inFront = result.clipW > 0;
  const inPicture =
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    x <= cssWidth &&
    y >= 0 &&
    y <= cssHeight;

  return { x, y, visible: inFront && inPicture };
}
