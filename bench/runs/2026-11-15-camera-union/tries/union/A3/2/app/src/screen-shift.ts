import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

// A copy of the camera's matrices at one moment. The camera hands out its own
// cache objects, which are overwritten on the next change, so they must be copied.
interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  // Only set when the camera uses a floating origin: its matrices are then
  // camera-relative and points must be offset by the camera position at that time.
  origin: Vec | undefined;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
  const view = getViewMatrix(camera).slice() as Mat;
  const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Mat;
  let origin: Vec | undefined;
  if (camera._useFloatingOrigin) {
    const p = getCameraPosition(camera);
    origin = { x: p.x, y: p.y, z: p.z };
  }
  return { view, viewProjection, origin };
}

function project(point: Vec, snap: Snapshot, canvas: HTMLCanvasElement): { x: number; y: number } {
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = canvas.clientHeight || canvas.height;
  const r = projectWorldToScreen(point, snap.view, snap.viewProjection, {
    viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    backingWidth: canvas.width,
    backingHeight: canvas.height,
    cssWidth,
    cssHeight,
    ...(snap.origin ? { worldOrigin: snap.origin } : {}),
  });
  return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Snapshot = capture(camera, canvas);

  return {
    mark(): void {
      marked = capture(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const before = project(point, marked, canvas);
      const after = project(point, capture(camera, canvas), canvas);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
