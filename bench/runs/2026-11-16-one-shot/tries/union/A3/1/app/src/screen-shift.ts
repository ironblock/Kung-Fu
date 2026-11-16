import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  origin: Vec | undefined;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

// The library returns its own cache objects, which are overwritten on the next
// change, so every matrix kept here is a private copy.
function copyMat(m: Mat): Mat {
  return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // The camera renders to the whole canvas, so the aspect ratio is the canvas
  // backing size and the viewport is the full backing buffer.
  const take = (): Snapshot => {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = backingWidth / backingHeight;
    return {
      view: copyMat(getViewMatrix(camera)),
      viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
      // With a floating origin the view matrix is camera-relative, so the
      // projection needs the camera's world position as its origin.
      origin: camera._useFloatingOrigin ? { ...getCameraPosition(camera) } : undefined,
      backingWidth,
      backingHeight,
      cssWidth: canvas.clientWidth || backingWidth,
      cssHeight: canvas.clientHeight || backingHeight,
    };
  };

  const project = (point: Vec, s: Snapshot) =>
    projectWorldToScreen(point, s.view, s.viewProjection, {
      viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
      backingWidth: s.backingWidth,
      backingHeight: s.backingHeight,
      cssWidth: s.cssWidth,
      cssHeight: s.cssHeight,
      ...(s.origin ? { worldOrigin: s.origin } : {}),
    });

  let marked = take();

  return {
    mark() {
      marked = take();
    },
    shift(point) {
      const before = project(point, marked);
      const after = project(point, take());
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
