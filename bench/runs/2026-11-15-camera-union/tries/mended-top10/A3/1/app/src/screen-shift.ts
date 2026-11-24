import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

type Mat = ReturnType<typeof getViewMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  options: ProjectionOptions;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // Copies are taken because the library may hand back cached matrix storage
  // that is overwritten when the camera changes.
  function capture(): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    return {
      view: structuredClone(getViewMatrix(camera)),
      viewProjection: structuredClone(getViewProjectionMatrix(camera, aspect)),
      options: {
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
      },
    };
  }

  let marked: Snapshot = capture();

  return {
    mark() {
      marked = capture();
    },
    shift(point: Vec) {
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
      const now = capture();
      const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
