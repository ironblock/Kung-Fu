import type { Camera } from "@babylonjs/lite";
import { getProjectionMatrix, getViewMatrix } from "@babylonjs/lite";

/**
 * Where a world-space point lands on a canvas that the camera renders to in full.
 *
 * x and y are CSS pixels from the canvas's top-left corner (y grows downward).
 * visible is true when the point is in front of the camera (view-space z > 0)
 * and inside the picture. Distance is not checked, so points beyond the far
 * clipping plane still count as visible.
 *
 * For a point behind the camera, visible is always false. The x and y values
 * are then only the mirrored projection and should not be used for an arrow.
 *
 * The far plane is ignored by using only the x and w rows of the projection.
 * Those do not depend on the far plane for either perspective or orthographic
 * projections.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  // Use the same matrices the renderer uses, so the label agrees with the picture.
  const view = getViewMatrix(camera);
  const proj = getProjectionMatrix(camera);

  // Babylon uses row vectors: v' = p * M, with translation in elements 12..14.
  // The view matrix is affine, so the homogeneous w of the view-space point is 1.
  const vx = point.x * view[0] + point.y * view[4] + point.z * view[8] + view[12];
  const vy = point.x * view[1] + point.y * view[5] + point.z * view[9] + view[13];
  const vz = point.x * view[2] + point.y * view[6] + point.z * view[10] + view[14];

  // Clip-space x and w. The z row is left out on purpose, since it carries the far plane.
  const cx = vx * proj[0] + vy * proj[4] + vz * proj[8] + proj[12];
  const cw = vx * proj[3] + vy * proj[7] + vz * proj[11] + proj[15];

  const ndcX = cw !== 0 ? cx / cw : 0;
  const cy = vx * proj[1] + vy * proj[5] + vz * proj[9] + proj[13];
  const ndcY = cw !== 0 ? cy / cw : 0;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const x = ((ndcX + 1) * 0.5) * width;
  const y = ((1 - ndcY) * 0.5) * height;

  const inFront = vz > 0;
  const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return { x, y, visible: inFront && inPicture };
}
