import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  options: ProjectionOptions;
}

// The library hands out matrices that may be cached and overwritten later,
// so every matrix used across calls must be copied at capture time.
function copyMat(m: Mat): Mat {
  return m.slice() as Mat;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
  return {
    view: copyMat(getViewMatrix(camera)),
    viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
    options: {
      viewport: { ...viewport },
      backingWidth,
      backingHeight,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    },
  };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Snapshot = capture(camera, canvas);

  return {
    mark(): void {
      marked = capture(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const now = capture(camera, canvas);
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
      const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
