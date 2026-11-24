import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;
type Options = Parameters<typeof projectWorldToScreen>[3];
type Point = Parameters<typeof projectWorldToScreen>[0];

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

// The library may hand back cached, reused matrix storage, so each
// snapshot copies the matrices instead of keeping references to them.
interface Frame {
  view: Float64Array;
  viewProjection: Float64Array;
  options: Options;
}

function copyMat(m: Mat): Float64Array {
  return Float64Array.from(m as unknown as ArrayLike<number>);
}

function snapshot(camera: Camera, canvas: HTMLCanvasElement): Frame {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;
  // The camera renders to the whole canvas, so the viewport is the full backing buffer.
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  return {
    view: copyMat(getViewMatrix(camera)),
    // Captures fov, position, orientation and aspect at this moment.
    viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
    options: {
      viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
    },
  };
}

function projectWith(point: Vec, frame: Frame) {
  return projectWorldToScreen(
    point as unknown as Point,
    frame.view as unknown as Mat,
    frame.viewProjection as unknown as Mat,
    frame.options,
  );
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = snapshot(camera, canvas);

  return {
    mark() {
      marked = snapshot(camera, canvas);
    },
    shift(point: Vec) {
      const now = snapshot(camera, canvas);
      const before = projectWith(point, marked);
      const after = projectWith(point, now);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
