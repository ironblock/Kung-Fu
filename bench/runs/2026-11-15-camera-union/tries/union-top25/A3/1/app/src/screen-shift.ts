import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = Parameters<typeof projectWorldToScreen>[1];
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  options: ProjectionOptions;
}

// The library hands out matrices that live in per-camera caches which are
// overwritten on the next change, so a mark must hold its own copy.
function copyMatrix(m: Mat): Mat {
  return Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
}

// The camera renders to the whole canvas, so the pixel viewport is the full
// backing store. The CSS size is captured too, so a resize between mark and
// shift shows up as movement, as it does on screen.
function captureOptions(canvas: HTMLCanvasElement): ProjectionOptions {
  return {
    viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    backingWidth: canvas.width,
    backingHeight: canvas.height,
    cssWidth: canvas.clientWidth || canvas.width,
    cssHeight: canvas.clientHeight || canvas.height,
  };
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const aspect = canvas.width / canvas.height;
  return {
    view: copyMatrix(getViewMatrix(camera)),
    viewProjection: copyMatrix(getViewProjectionMatrix(camera, aspect)),
    options: captureOptions(canvas),
  };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = capture(camera, canvas);

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
