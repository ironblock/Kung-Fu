import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type Viewport = ReturnType<typeof resolveCameraViewport>;

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  origin: Vec | undefined;
  viewport: Viewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function copyMat(m: Mat): Mat {
  // Camera matrices may be cache objects that get overwritten, so keep a copy.
  return (m as unknown as { slice(): unknown }).slice() as Mat;
}

function copyVec(v: Vec): Vec {
  return { x: v.x, y: v.y, z: v.z };
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  return {
    view: copyMat(getViewMatrix(camera)),
    viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
    // With floating origin, the view matrix is relative to the camera position at that time.
    origin: camera._useFloatingOrigin ? copyVec(getCameraPosition(camera)) : undefined,
    viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  };
}

function screenPoint(
  point: Vec,
  s: Snapshot,
): { x: number; y: number } {
  const r = projectWorldToScreen(point, s.view, s.viewProjection, {
    viewport: s.viewport,
    backingWidth: s.backingWidth,
    backingHeight: s.backingHeight,
    cssWidth: s.cssWidth,
    cssHeight: s.cssHeight,
    worldOrigin: s.origin,
  });
  return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = takeSnapshot(camera, canvas);
  return {
    mark(): void {
      marked = takeSnapshot(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const before = screenPoint(point, marked);
      const now = takeSnapshot(camera, canvas);
      const after = screenPoint(point, now);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
