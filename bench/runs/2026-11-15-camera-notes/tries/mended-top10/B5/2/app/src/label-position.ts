import type { Camera } from "@babylonjs/lite";
import { getViewMatrix } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixel coordinates on a canvas that the
 * camera renders to in full.
 *
 * - `x`, `y`: where the point lands, in CSS pixels from the canvas's top-left
 *   corner. Points outside the picture still get coordinates (past the edge),
 *   which is useful for placing arrows. For points behind the camera they are
 *   NaN, because no meaningful screen direction exists there.
 * - `visible`: true when the point is in front of the camera and inside the
 *   picture. The far clipping distance is deliberately ignored, so distant
 *   geometry beyond `farPlane` still counts as visible.
 *
 * The projection is computed here rather than with getViewProjectionMatrix,
 * because that matrix includes the far plane and would clip distant points.
 * Assumes a perspective camera (camera.ortho not set) with a vertical `fov`
 * in radians, and a view matrix stored column-major with the translation in
 * elements 12..14.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const aspect = width / height;

  const m: ArrayLike<number> = getViewMatrix(camera);
  const { x, y, z } = point;

  // Transform the world point into view space.
  const vx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const vy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const vz = m[2] * x + m[6] * y + m[10] * z + m[14];

  // Behind the camera (or exactly in the eye plane): never visible, and no
  // meaningful screen position.
  if (!(vz > 0)) {
    return { x: NaN, y: NaN, visible: false };
  }

  // Perspective divide to normalized device coordinates in [-1, 1] for the
  // picture. Values outside that range are off-screen.
  const tanHalfFov = Math.tan(camera.fov / 2);
  const ndcX = vx / (vz * tanHalfFov * aspect);
  const ndcY = vy / (vz * tanHalfFov);

  // Map NDC to CSS pixels, y pointing down.
  const cssX = ((ndcX + 1) / 2) * width;
  const cssY = ((1 - ndcY) / 2) * height;

  const inside = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return { x: cssX, y: cssY, visible: inside };
}
