import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Matrix = ReturnType<typeof getViewMatrix>;
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[3];

interface Snapshot {
  view: Matrix;
  viewProjection: Matrix;
  options: ProjectionOptions;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // The library returns its own cache arrays, which are overwritten on the next
  // change, so every matrix is copied at the moment it is captured.
  function capture(): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = structuredClone(getViewMatrix(camera));
    const viewProjection = structuredClone(getViewProjectionMatrix(camera, aspect));
    return {
      view,
      viewProjection,
      options: {
        // The camera renders to the whole canvas.
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        cssWidth: rect.width,
        cssHeight: rect.height,
      },
    };
  }

  let marked: Snapshot = capture();

  return {
    mark(): void {
      marked = capture();
    },
    shift(point: Vec): { dx: number; dy: number } {
      const now = capture();
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
      const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
