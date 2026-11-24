import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Matrix = ReturnType<typeof getViewMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Pose {
  view: Matrix;
  viewProjection: Matrix;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // The library returns its own cache arrays, which are overwritten on the next
  // call after a change, so each pose is copied when it is taken.
  function readPose(): Pose {
    const aspect = canvas.width / canvas.height;
    const view = getViewMatrix(camera).slice() as Matrix;
    const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Matrix;
    return { view, viewProjection };
  }

  // The camera renders to the whole canvas, so the viewport is the full backing store.
  // cssWidth/cssHeight make projectWorldToScreen report CSS pixels directly.
  function projectionOptions(): ProjectionOptions {
    const rect = canvas.getBoundingClientRect();
    return {
      viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
      backingWidth: canvas.width,
      backingHeight: canvas.height,
      cssWidth: rect.width,
      cssHeight: rect.height,
    };
  }

  let marked = readPose();

  return {
    mark() {
      marked = readPose();
    },
    shift(point) {
      const options = projectionOptions();
      const now = readPose();
      // Both positions are mapped onto the canvas as it is now, so a pure canvas
      // resize without an aspect change does not register as movement.
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, options);
      const after = projectWorldToScreen(point, now.view, now.viewProjection, options);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
