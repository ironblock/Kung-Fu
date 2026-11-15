import type { Camera } from "@babylonjs/lite";
// UNVERIFIED: the library is not on this machine. This import and the call
// below are written against the projectWorldToScreen behaviour described in
// camera-notes.md (note 21), not against its real source or signature.
import { projectWorldToScreen } from "@babylonjs/lite";

/**
 * Where a world-space point appears over the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * - x/y are unclamped, so a point off the picture still gives its position
 *   (useful for edge arrows).
 * - visible: in front of the camera and inside the picture. Distance is not
 *   limited, so points beyond the far clipping plane can still be visible.
 * - A point behind the camera is never visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  // ASSUMED signature: the viewport object carries backing and CSS sizes.
  const projected = projectWorldToScreen(camera, point, {
    width: canvas.width,
    height: canvas.height,
    cssWidth,
    cssHeight,
  });

  const x = projected.cssX;
  const y = projected.cssY;

  // ASSUMED: depth z is 0..1 in front of the camera and negative behind it.
  // Values above 1 (beyond the far plane) are kept, so distant points stay visible.
  const inFront = projected.z >= 0;
  const inPicture = x >= 0 && x <= cssWidth && y >= 0 && y <= cssHeight;

  return { x, y, visible: inFront && inPicture };
}
