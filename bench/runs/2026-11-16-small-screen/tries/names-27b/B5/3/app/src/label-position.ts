import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const cssWidth = canvas.clientWidth || canvas.width || 1;
  const cssHeight = canvas.clientHeight || canvas.height || 1;
  const backingWidth = canvas.width || cssWidth;
  const backingHeight = canvas.height || cssHeight;

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  if (!Number.isFinite(aspect) || aspect <= 0) {
    return { x: 0, y: 0, visible: false };
  }

  const view = getViewMatrix(camera) as unknown as number[];
  const proj = getProjectionMatrix(camera, aspect) as unknown as number[];
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  if (
    !Number.isFinite(viewport.x) ||
    !Number.isFinite(viewport.y) ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const px = point.x;
  const py = point.y;
  const pz = point.z;

  // Babylon/Babylon-Lite matrices are column-major; these indices transform
  // a world point into camera/view space.
  const viewX = px * view[0] + py * view[4] + pz * view[8] + view[12];
  const viewY = px * view[1] + py * view[5] + pz * view[9] + view[13];
  const viewZ = px * view[2] + py * view[6] + pz * view[10] + view[14];

  // In Babylon conventions, points in front of the camera have negative view Z.
  if (!Number.isFinite(viewZ) || viewZ >= 0) {
    return { x: 0, y: 0, visible: false };
  }

  // Project the view-space point. We intentionally ignore near/far clipping:
  // only the sign of clipW and the NDC x/y bounds matter for visibility here.
  const clipX = viewX * proj[0] + viewY * proj[4] + viewZ * proj[8] + proj[12];
  const clipY = viewX * proj[1] + viewY * proj[5] + viewZ * proj[9] + proj[13];
  const clipW = viewX * proj[3] + viewY * proj[7] + viewZ * proj[11] + proj[15];

  if (clipW === 0) {
    return { x: 0, y: 0, visible: false };
  }

  const ndcX = clipX / clipW;
  const ndcY = clipY / clipW;

  if (!Number.isFinite(ndcX) || !Number.isFinite(ndcY)) {
    return { x: 0, y: 0, visible: false };
  }

  const visible = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

  const x =
    (viewport.x + (ndcX + 1) * 0.5 * viewport.width) *
    (cssWidth / backingWidth);
  const y =
    (viewport.y + (1 - ndcY) * 0.5 * viewport.height) *
    (cssHeight / backingHeight);

  return { x, y, visible };
}
