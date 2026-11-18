import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let savedView: Float32Array;
  let savedVP: Float32Array;

  function doMark(): void {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    const v = getViewMatrix(camera);
    const vp = getViewProjectionMatrix(camera, aspect);
    savedView = new Float32Array(v);
    savedVP = new Float32Array(vp);
  }

  doMark();

  return {
    mark: doMark,
    shift(point: Vec): { dx: number; dy: number } {
      const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
      const curV = new Float32Array(getViewMatrix(camera));
      const curVP = new Float32Array(getViewProjectionMatrix(camera, aspect));

      const viewport = resolveCameraViewport(camera, canvas.width, canvas.height);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;

      const opts = {
        viewport,
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        cssWidth: cssW,
        cssHeight: cssH,
      };

      const before = projectWorldToScreen(point, savedView, savedVP, opts);
      const now = projectWorldToScreen(point, curV, curVP, opts);

      return { dx: now.cssX - before.cssX, dy: now.cssY - before.cssY };
    },
  };
}
