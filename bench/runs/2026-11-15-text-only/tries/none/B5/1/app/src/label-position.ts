import type { Camera } from "@babylonjs/lite";

export interface LabelPosition {
  /** CSS pixels from the canvas's left edge. May lie outside [0, width] when not visible. */
  x: number;
  /** CSS pixels from the canvas's top edge. May lie outside [0, height] when not visible. */
  y: number;
  /** True when the point is in front of the camera and inside the picture (any distance). */
  visible: boolean;
}

type Matrix16 = ArrayLike<number>;

/**
 * UNVERIFIED: the view and projection accessors below follow the common Babylon naming
 * (getViewMatrix / getProjectionMatrix). Babylon Lite 1.39.0 was not available to check
 * them. If the real API differs, change only this function.
 */
function viewAndProjection(camera: Camera): { view: Matrix16; projection: Matrix16 } {
  const c = camera as unknown as {
    getViewMatrix(): Matrix16;
    getProjectionMatrix(): Matrix16;
  };
  return { view: c.getViewMatrix(), projection: c.getProjectionMatrix() };
}

/**
 * Row-vector convention (as in Babylon): [x y z w] * M, with translation in
 * elements 12..14 and the w row in elements 3, 7, 11, 15.
 */
function transform(
  m: Matrix16,
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

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): LabelPosition {
  const { view, projection } = viewAndProjection(camera);

  // World -> view space.
  const [vx, vy, vz, vw] = transform(view, point.x, point.y, point.z, 1);
  // View -> clip space.
  const [cx, cy, , cw] = transform(projection, vx, vy, vz, vw);

  // Normalized device coordinates, x and y in [-1, 1] when inside the picture.
  // The far-plane and near-plane clip values (clip z) are deliberately ignored, so
  // points beyond the far clipping distance still count as inside the picture.
  const ndcX = cx / cw;
  const ndcY = cy / cw;

  // CSS pixel size of the canvas (the camera renders to the whole canvas).
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // NDC y points up; screen y points down.
  const x = ((ndcX + 1) / 2) * width;
  const y = ((1 - ndcY) / 2) * height;

  // View-space z > 0 means in front of the camera (left-handed Babylon convention).
  // cw > 0 also covers the perspective case, where cw equals view-space z.
  const inFront = vz > 0 && cw > 0;
  const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  return { x, y, visible: inFront && inPicture };
}
