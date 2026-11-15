import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

// A copy of everything needed to project a point as the camera draws it now.
// The library returns its own cache objects, which are overwritten in place,
// so the matrices must be copied before they are kept or reused.
interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function copyMat(m: Mat): Mat {
  return m.slice() as Mat;
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  // The camera renders to the whole canvas, so the aspect ratio is the canvas's own.
  const aspect = backingWidth / backingHeight;
  // Read view first and copy it before the view-projection call, in case the two share storage.
  const view = copyMat(getViewMatrix(camera));
  const viewProjection = copyMat(getViewProjectionMatrix(camera, aspect));
  return {
    view,
    viewProjection,
    backingWidth,
    backingHeight,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
  };
}

function project(point: Vec, s: Snapshot): { x: number; y: number } {
  const r = projectWorldToScreen(point, s.view, s.viewProjection, {
    viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
    backingWidth: s.backingWidth,
    backingHeight: s.backingHeight,
    cssWidth: s.cssWidth,
    cssHeight: s.cssHeight,
  });
  return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Snapshot | null = null;

  const tracker: ShiftTracker = {
    mark() {
      marked = takeSnapshot(camera, canvas);
    },
    shift(point: Vec) {
      if (!marked) {
        throw new Error("trackScreenShift: mark() has not been called");
      }
      const now = takeSnapshot(camera, canvas);
      const before = project(point, marked);
      const after = project(point, now);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };

  tracker.mark();
  return tracker;
}
