import type { Camera } from "@babylonjs/lite";

type Matrix4 = ArrayLike<number>;

export interface LabelPosition {
  x: number;
  y: number;
  visible: boolean;
}

// Reads a camera matrix as a flat 16-element array.
// Babylon-style matrix objects keep their data in `.m`; plain arrays are used as-is.
function matrixData(matrix: unknown): Matrix4 {
  const holder = matrix as { m?: Matrix4 };
  return holder.m ?? (matrix as Matrix4);
}

// Row-vector transform, matching Babylon's convention: v' = v * M.
// Translation lives in elements 12..14 and the w terms in 3, 7, 11, 15.
function transform(
  m: Matrix4,
  x: number,
  y: number,
  z: number,
  w: number,
): [number, number, number, number] {
  return [
    x * m[0] + y * m[4] + z * m[8] + w * m[12],
    x * m[1] + y * m[5] + z * m[9] + w * m[13],
    x * m[2] + y * m[6] + z * m[10] + w * m[14],
    x * m[3] + y * m[7] + z * m[11] + w * m[15],
  ];
}

/**
 * Projects a world-space point to CSS pixel coordinates on the canvas.
 *
 * - `visible` is true when the point is in front of the camera (positive clip w)
 *   and inside the picture. The far clipping distance is deliberately ignored,
 *   so distant geometry beyond the far plane still counts as visible.
 * - `x`/`y` give the screen position even when the point is off-screen, for
 *   placing an arrow. For points behind the camera `visible` is false, and the
 *   position uses abs(w) so the sign flip from w < 0 does not mirror the
 *   lateral direction.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): LabelPosition {
  const cam = camera as unknown as {
    getViewMatrix(): unknown;
    getProjectionMatrix(): unknown;
  };
  const view = matrixData(cam.getViewMatrix());
  const proj = matrixData(cam.getProjectionMatrix());

  // World -> view -> clip, using the row-vector convention.
  const [vx, vy, vz, vw] = transform(view, point.x, point.y, point.z, 1);
  const [cx, cy, , cw] = transform(proj, vx, vy, vz, vw);

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  const absW = Math.abs(cw);
  if (absW < 1e-12) {
    return { x: width / 2, y: height / 2, visible: false };
  }

  const ndcX = cx / absW;
  const ndcY = cy / absW;

  const x = ((ndcX + 1) / 2) * width;
  // NDC y points up; CSS y points down.
  const y = ((1 - ndcY) / 2) * height;

  const inFront = cw > 0;
  const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return { x, y, visible: inFront && inPicture };
}
