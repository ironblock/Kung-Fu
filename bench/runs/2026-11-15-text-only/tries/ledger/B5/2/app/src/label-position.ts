import type { Camera } from "@babylonjs/lite";
import { getViewProjectionMatrix } from "@babylonjs/lite";

/**
 * Where a world-space point sits on the canvas, in CSS pixels from the canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the picture, however far
 * away it is (the far clipping distance is deliberately ignored). `x` and `y` are always computed,
 * so a point in front of the camera but off-screen gives its position past the edge, for an arrow.
 * A point behind the camera is never visible; its x and y are not meaningful as an arrow direction.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  // Read the matrix through the library getter rather than the camera fields, so that any pending
  // fov, near/far or ortho change is picked up by the getter's own change check.
  // Assumed: column-major, 16 entries, WebGPU clip space (x and y in [-1, 1], depth in [0, 1]).
  const m: ArrayLike<number> = getViewProjectionMatrix(camera);
  const { x, y, z } = point;

  // Element (row r, column c) is m[c * 4 + r]. Multiply the matrix by (x, y, z, 1).
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cz = m[2] * x + m[6] * y + m[10] * z + m[14];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];

  // An orthographic projection leaves the bottom row as (0, 0, 0, 1), so w carries no depth.
  const orthographic =
    Math.abs(m[3]) < 1e-12 && Math.abs(m[7]) < 1e-12 && Math.abs(m[11]) < 1e-12 && Math.abs(m[15] - 1) < 1e-12;

  // Perspective: w equals view-space depth (left-handed), so w > 0 means in front of the eye.
  // Orthographic: w is always 1, so depth comes from clip z in [0, 1]; z < 0 is before the near plane.
  // Caveat: in orthographic mode this also marks points between the eye and the near plane as behind.
  const w = Math.abs(cw) < Number.EPSILON ? Number.EPSILON : cw;
  const ndcX = cx / w;
  const ndcY = cy / w;
  const inFront = orthographic ? cz / w >= 0 : cw > 0;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return {
    // NDC x runs left to right, NDC y runs bottom to top; CSS y runs top to bottom.
    x: ((ndcX + 1) / 2) * width,
    y: ((1 - ndcY) / 2) * height,
    visible: inFront && inPicture,
  };
}
