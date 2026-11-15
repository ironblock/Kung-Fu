import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type ScreenOptions = Parameters<typeof projectWorldToScreen>[3];

// Everything needed to project a world point to CSS pixels as the camera
// saw it at one moment. The matrices are copied because the library may
// return internal cache storage that is overwritten when the camera changes.
interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  options: ScreenOptions;
}

function copyMatrix(m: Mat): Mat {
  return Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  function capture(): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    return {
      view: copyMatrix(getViewMatrix(camera)),
      viewProjection: copyMatrix(getViewProjectionMatrix(camera, aspect)),
      options: {
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
      },
    };
  }

  let marked = capture();

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
