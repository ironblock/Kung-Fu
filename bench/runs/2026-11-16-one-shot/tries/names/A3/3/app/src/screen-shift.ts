import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Matrix = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface Snapshot {
  view: Matrix;
  viewProjection: Matrix;
}

// The library may return cached storage that it overwrites later, so copy.
function copyMatrix(m: Matrix): Matrix {
  return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Matrix;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  const aspect = (): number => getEffectiveAspectRatio(camera, canvas.width, canvas.height);

  const takeSnapshot = (): Snapshot => ({
    view: copyMatrix(getViewMatrix(camera)),
    viewProjection: copyMatrix(getViewProjectionMatrix(camera, aspect())),
  });

  const screenOptions = () => ({
    viewport: resolveCameraViewport(camera, canvas.width, canvas.height),
    backingWidth: canvas.width,
    backingHeight: canvas.height,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
  });

  let marked: Snapshot = takeSnapshot();

  return {
    mark(): void {
      marked = takeSnapshot();
    },

    shift(point: Vec): { dx: number; dy: number } {
      const options = screenOptions();
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, options);
      const after = projectWorldToScreen(
        point,
        getViewMatrix(camera),
        getViewProjectionMatrix(camera, aspect()),
        options,
      );
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
