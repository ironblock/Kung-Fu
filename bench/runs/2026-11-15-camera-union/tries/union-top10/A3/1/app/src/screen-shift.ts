import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

interface Pose {
  view: Mat;
  viewProj: Mat;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // Copies are taken right away: the library may hand back cache storage that it overwrites later.
  const capture = (): Pose => {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    return {
      view: structuredClone(getViewMatrix(camera)),
      viewProj: structuredClone(getViewProjectionMatrix(camera, aspect)),
    };
  };

  // Projects a world point to CSS pixels on the canvas for the given pose.
  // The camera renders to the whole canvas, so the viewport covers the full backing store.
  const toCss = (point: Vec, pose: Pose): { x: number; y: number } => {
    const p = projectWorldToScreen(point, pose.view, pose.viewProj, {
      viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
      backingWidth: canvas.width,
      backingHeight: canvas.height,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    });
    return { x: p.cssX, y: p.cssY };
  };

  let marked: Pose = capture();

  return {
    mark(): void {
      marked = capture();
    },
    shift(point: Vec): { dx: number; dy: number } {
      const before = toCss(point, marked);
      const after = toCss(point, capture());
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
