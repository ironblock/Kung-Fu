import type { Camera } from "@babylonjs/lite";
// ASSUMPTION (unverified: the library is not on this machine): the camera
// matrix getters are exported from "@babylonjs/lite" under these names, and
// return a 16-element row-major Float32Array with row-vector multiplication
// (Babylon convention: translation in elements 12..14, clip = [x, y, z, 1] * M).
// If the export names differ, change only these two imports.
import { getViewMatrix, getProjectionMatrix } from "@babylonjs/lite";

export interface LabelPosition {
  /** CSS pixels from the canvas's top-left corner. May lie outside the canvas. */
  x: number;
  /** CSS pixels from the canvas's top-left corner. May lie outside the canvas. */
  y: number;
  /** In front of the camera and inside the picture. Ignores the far clip distance. */
  visible: boolean;
}

/** Row-vector transform of a point by a row-major 4x4 matrix (Babylon layout). */
function transform(m: ArrayLike<number>, x: number, y: number, z: number): [number, number, number, number] {
  return [
    x * m[0] + y * m[4] + z * m[8] + m[12],
    x * m[1] + y * m[5] + z * m[9] + m[13],
    x * m[2] + y * m[6] + z * m[10] + m[14],
    x * m[3] + y * m[7] + z * m[11] + m[15],
  ];
}

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): LabelPosition {
  const view = getViewMatrix(camera);
  const proj = getProjectionMatrix(camera);

  // View space: Babylon is left-handed, so the camera looks down +z.
  // Depth is tested here, not against the projection's depth range, so that
  // points beyond the far clip distance still count as in front.
  const [vx, vy, vz] = transform(view, point.x, point.y, point.z);

  // Projection. For perspective, w equals vz; for orthographic, w is 1.
  const [cx, cy, , cw] = transform(proj, vx, vy, vz);

  // Normalised device coordinates. Divide by w as-is; the sign of w for points
  // behind the camera is meaningless, and those are never visible anyway.
  const ndcX = cw !== 0 ? cx / cw : Number.NaN;
  const ndcY = cw !== 0 ? cy / cw : Number.NaN;

  // Use CSS size, not canvas.width/height (which are device pixels).
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;

  const x = (ndcX * 0.5 + 0.5) * width;
  // NDC y points up; screen y points down.
  const y = (0.5 - ndcY * 0.5) * height;

  const visible =
    vz > 0 &&
    Number.isFinite(ndcX) &&
    Number.isFinite(ndcY) &&
    Math.abs(ndcX) <= 1 &&
    Math.abs(ndcY) <= 1;

  return { x, y, visible };
}
