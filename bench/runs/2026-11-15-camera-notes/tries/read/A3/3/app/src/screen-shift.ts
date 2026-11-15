import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera, ScreenProjectionOptions } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

// A copy of the camera's matrices and projection settings at one moment, plus
// the canvas geometry that was in effect then. The camera's own matrices are
// cached and reused, so they must be copied before they are kept.
interface Snapshot {
  view: ReturnType<typeof getViewMatrix>;
  viewProjection: ReturnType<typeof getViewProjectionMatrix>;
  options: ScreenProjectionOptions;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  const capture = (): Snapshot => {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);

    const options: ScreenProjectionOptions = {
      viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
      backingWidth,
      backingHeight,
      cssWidth: rect.width,
      cssHeight: rect.height,
    };
    // With floating origin the view matrix has no translation, so the point
    // must be made relative to the camera's position at this moment.
    if (camera._useFloatingOrigin) {
      options.worldOrigin = { ...getCameraPosition(camera) };
    }

    return {
      view: structuredClone(getViewMatrix(camera)),
      viewProjection: structuredClone(getViewProjectionMatrix(camera, aspect)),
      options,
    };
  };

  let marked: Snapshot = capture();

  return {
    mark() {
      marked = capture();
    },
    shift(point: Vec) {
      const now = capture();
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
      const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
