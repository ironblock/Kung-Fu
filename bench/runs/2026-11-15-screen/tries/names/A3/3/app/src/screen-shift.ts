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

type Mat4 = ReturnType<typeof getViewMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Snapshot {
  view: Mat4;
  viewProjection: Mat4;
  options: ProjectionOptions;
}

// The library hands out matrices that may be cache storage which is rewritten
// later, so a snapshot must hold its own copy.
function copyMat(m: Mat4): Mat4 {
  return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Mat4;
}

// Captures everything that determines where a world point lands on the canvas
// right now: view matrix, projection (fov, near/far, ortho, aspect) and the
// pixel viewport. The camera renders to the whole canvas.
function snapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const vp = resolveCameraViewport(camera, backingWidth, backingHeight);
  return {
    view: copyMat(getViewMatrix(camera)),
    viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
    options: {
      viewport: { x: vp.x, y: vp.y, width: vp.width, height: vp.height },
      backingWidth,
      backingHeight,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    },
  };
}

function project(point: Vec, s: Snapshot): { x: number; y: number } {
  const r = projectWorldToScreen(point, s.view, s.viewProjection, s.options);
  return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = snapshot(camera, canvas);

  return {
    mark() {
      marked = snapshot(camera, canvas);
    },
    shift(point: Vec) {
      const now = snapshot(camera, canvas);
      const before = project(point, marked);
      const after = project(point, now);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
