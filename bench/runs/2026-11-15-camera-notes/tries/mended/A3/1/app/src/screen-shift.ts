import {
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // getViewMatrix / getViewProjectionMatrix return the camera's own cache
  // objects, which are overwritten in place on the next change, so the marked
  // state must be copied.
  let markView: Mat | null = null;
  let markViewProj: Mat | null = null;

  const copy = (m: Mat): Mat => m.slice() as Mat;

  // The camera renders to the whole canvas, so the aspect ratio is the canvas's.
  const aspect = (): number => canvas.width / canvas.height;

  // Project with the given matrices onto the current canvas geometry.
  const toCss = (point: Vec, view: Mat, viewProj: Mat): { x: number; y: number } => {
    const w = canvas.width;
    const h = canvas.height;
    const r = projectWorldToScreen(point, view, viewProj, {
      viewport: { x: 0, y: 0, width: w, height: h },
      backingWidth: w,
      backingHeight: h,
      cssWidth: canvas.clientWidth || w,
      cssHeight: canvas.clientHeight || h,
    });
    return { x: r.cssX, y: r.cssY };
  };

  const mark = (): void => {
    markView = copy(getViewMatrix(camera));
    markViewProj = copy(getViewProjectionMatrix(camera, aspect()));
  };

  const shift = (point: Vec): { dx: number; dy: number } => {
    if (!markView || !markViewProj) {
      throw new Error("trackScreenShift: no mark");
    }
    const before = toCss(point, markView, markViewProj);
    const view = getViewMatrix(camera);
    const viewProj = getViewProjectionMatrix(camera, aspect());
    const after = toCss(point, view, viewProj);
    return { dx: after.x - before.x, dy: after.y - before.y };
  };

  mark();
  return { mark, shift };
}
