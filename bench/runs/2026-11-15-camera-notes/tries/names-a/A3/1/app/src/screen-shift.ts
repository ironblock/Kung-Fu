import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Mat = ReturnType<typeof getViewMatrix>;
type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let markedView: Mat | null = null;
  let markedViewProj: Mat | null = null;

  // Copy the matrices immediately: the library may hand back its internal cache
  // objects, which get overwritten the next time the camera is evaluated.
  function snapshot(): { view: Mat; viewProj: Mat } {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    const viewProj = getViewProjectionMatrix(camera, aspect).slice() as Mat;
    const view = getViewMatrix(camera).slice() as Mat;
    return { view, viewProj };
  }

  function project(point: Vec, view: Mat, viewProj: Mat) {
    return projectWorldToScreen(point, view, viewProj, {
      viewport: resolveCameraViewport(camera, canvas.width, canvas.height),
      backingWidth: canvas.width,
      backingHeight: canvas.height,
      cssWidth: canvas.clientWidth || canvas.width,
      cssHeight: canvas.clientHeight || canvas.height,
    });
  }

  function mark(): void {
    const s = snapshot();
    markedView = s.view;
    markedViewProj = s.viewProj;
  }

  mark();

  return {
    mark,
    shift(point: Vec) {
      if (!markedView || !markedViewProj) {
        throw new Error("screen-shift: no mark has been taken");
      }
      const now = snapshot();
      const before = project(point, markedView, markedViewProj);
      const after = project(point, now.view, now.viewProj);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
