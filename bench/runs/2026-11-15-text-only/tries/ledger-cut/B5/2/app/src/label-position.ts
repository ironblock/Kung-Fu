import type { Camera } from "@babylonjs/lite";
// ASSUMED export: the ledger names getViewProjectionMatrix in src/camera but does not say it is
// re-exported from the package root, nor its exact signature. Verify before relying on this.
import { getViewProjectionMatrix } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels over a canvas that the camera fills completely.
 *
 * - x, y: where the point lands, in CSS pixels from the canvas's top-left corner. For points behind
 *   the camera or outside the picture, x and y still give a usable direction (past the edge).
 * - visible: true when the point is in front of the camera (clip w > 0) and inside the picture.
 *   The near and far clipping distances are deliberately ignored, so distant points count as visible.
 *
 * Assumes a perspective projection. In orthographic mode w is always 1, so the behind-camera test
 * cannot detect points behind the camera; this function does not handle that case.
 *
 * Not cached: the matrix is read on every call, because projection changes (fov, planes, ortho)
 * are not reflected in worldMatrixVersion alone.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  // ASSUMED: returns a 16-entry array in Babylon's convention, where a point is transformed as a
  // row vector (clip = [x, y, z, 1] * M), so translation sits in entries 12-14 and w in 3, 7, 11, 15.
  const m = getViewProjectionMatrix(camera) as ArrayLike<number>;

  const cx = point.x * m[0] + point.y * m[4] + point.z * m[8] + m[12];
  const cy = point.x * m[1] + point.y * m[5] + point.z * m[9] + m[13];
  const cw = point.x * m[3] + point.y * m[7] + point.z * m[11] + m[15];

  // CSS size, not canvas.width/height, which are device pixels.
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (cw === 0) {
    // Point lies in the camera's plane through the eye; no projection exists.
    return { x: width / 2, y: height / 2, visible: false };
  }

  // Dividing by |w| keeps the screen direction correct for points behind the camera
  // (where w is negative and dividing by w would mirror the direction).
  const ndcX = cx / Math.abs(cw);
  const ndcY = cy / Math.abs(cw);

  return {
    x: ((ndcX + 1) / 2) * width,
    y: ((1 - ndcY) / 2) * height,
    visible: cw > 0 && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1,
  };
}
