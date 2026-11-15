import type { Camera } from "@babylonjs/lite";
import { getViewProjectionMatrix } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels over the canvas.
 *
 * - x, y: where the point lands, in CSS pixels from the canvas's top-left
 *   corner. Points outside the picture (or behind the camera) still get a
 *   position, which can lie past the edge; for behind-camera points the
 *   position is not meaningful.
 * - visible: the point is in front of the camera (clip w > 0) and inside the
 *   picture horizontally and vertically. The depth (z) test is skipped on
 *   purpose, so points beyond the far clipping distance still count as
 *   visible. Points between the eye and the near plane are treated as in
 *   front, not clipped.
 *
 * Assumes a perspective camera. For orthographic cameras clip w is 1 for
 * every point, so the "behind the camera" test does not hold.
 *
 * Assumes the view-projection matrix uses the row-vector convention with
 * column-major storage (translation in elements 12, 13, 14), and that NDC y
 * points up.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const m = getViewProjectionMatrix(camera);

  const cx = point.x * m[0] + point.y * m[4] + point.z * m[8] + m[12];
  const cy = point.x * m[1] + point.y * m[5] + point.z * m[9] + m[13];
  const cw = point.x * m[3] + point.y * m[7] + point.z * m[11] + m[15];

  // Far-plane distance only changes clip z, so x/y/w are unaffected by it.
  const ndcX = cx / cw;
  const ndcY = cy / cw;

  // The camera draws into the whole canvas, so NDC maps onto the full CSS box.
  // clientWidth/clientHeight are CSS pixels; canvas.width is the backing store
  // and would be off by devicePixelRatio.
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  const x = ((ndcX + 1) * 0.5) * cssWidth;
  const y = ((1 - ndcY) * 0.5) * cssHeight;

  const inFront = cw > 0;
  const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return { x, y, visible: inFront && inPicture };
}
