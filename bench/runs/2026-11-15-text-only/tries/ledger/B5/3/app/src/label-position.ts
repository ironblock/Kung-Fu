import type { Camera } from "@babylonjs/lite";

type Vec4 = [number, number, number, number];

// Row-vector times matrix, with the matrix stored column-major (Babylon's layout):
// element (row r, column c) lives at m[r * 4 + c], so v' = v * M.
function transform(v: Vec4, m: ArrayLike<number>): Vec4 {
  const [x, y, z, w] = v;
  return [
    x * m[0] + y * m[4] + z * m[8] + w * m[12],
    x * m[1] + y * m[5] + z * m[9] + w * m[13],
    x * m[2] + y * m[6] + z * m[10] + w * m[14],
    x * m[3] + y * m[7] + z * m[11] + w * m[15],
  ];
}

/**
 * Where a world-space point appears on a canvas that the camera fills completely.
 *
 * x, y: CSS pixels from the canvas's top-left corner. For points outside the
 *       picture they give the (extrapolated) position past the edge, for arrows.
 * visible: the point is in front of the camera and inside the picture. The far
 *       clipping distance is deliberately ignored, so distant points can be visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  // Fetched on every call, not cached here: the library's projection cache is
  // keyed on the camera's change key, and the getters poll that key.
  const view = camera.getViewMatrix();
  const proj = camera.getProjectionMatrix();

  // View space: +z points forward (left-handed Babylon convention).
  const inView = transform([point.x, point.y, point.z, 1], view);
  const inFront = inView[2] > 0;

  // Clip space. For perspective, w equals view-space z; for orthographic, w is 1.
  const clip = transform(inView, proj);

  // Divide by |w| so that points behind a perspective camera (w < 0) still
  // point their arrow in the right direction instead of mirroring through the centre.
  const d = Math.abs(clip[3]) || Number.EPSILON;
  const ndcX = clip[0] / d;
  const ndcY = clip[1] / d;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  return {
    x: ((ndcX + 1) / 2) * width,
    y: ((1 - ndcY) / 2) * height,
    visible: inFront && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1,
  };
}
