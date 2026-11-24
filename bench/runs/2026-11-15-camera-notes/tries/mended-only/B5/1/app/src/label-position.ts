import type { Camera } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on the canvas, and reports whether
 * the point is in front of the camera and inside the picture.
 *
 * - `x`, `y`: where the point appears, in CSS pixels from the canvas's top-left
 *   corner. Points outside the picture keep their extrapolated position, so they
 *   can be used to place an off-screen arrow. Points exactly on the camera's
 *   plane of view (clip w === 0) give NaN.
 * - `visible`: true when the point is in front of the camera (clip w > 0) and
 *   its normalised device coordinates lie within [-1, 1] on both axes. Depth is
 *   deliberately ignored, so points beyond the far clipping distance can be
 *   visible. Points behind the camera are never visible.
 *
 * The projection is done here rather than with the library's projectWorldToScreen,
 * because that function's offscreen flag tests depth, which would reject points
 * beyond the far plane.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  // The camera returns its own cached matrix, overwritten on the next change, so
  // read it fresh on every call and do not keep a reference to it.
  // Row-vector convention: translation is in elements 12..14 and w is the
  // fourth component, read from elements 3, 7, 11 and 15.
  const m = camera.getViewProjectionMatrix() as unknown as ArrayLike<number>;

  const clipX = point.x * m[0] + point.y * m[4] + point.z * m[8] + m[12];
  const clipY = point.x * m[1] + point.y * m[5] + point.z * m[9] + m[13];
  const clipW = point.x * m[3] + point.y * m[7] + point.z * m[11] + m[15];

  const inFront = clipW > 0;
  const ndcX = clipW !== 0 ? clipX / clipW : NaN;
  const ndcY = clipW !== 0 ? clipY / clipW : NaN;

  // The camera renders to the whole canvas, so NDC spans the full CSS size.
  // NDC y points up; CSS y points down.
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const x = ((ndcX + 1) / 2) * width;
  const y = ((1 - ndcY) / 2) * height;

  const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return { x, y, visible: inFront && inPicture };
}
