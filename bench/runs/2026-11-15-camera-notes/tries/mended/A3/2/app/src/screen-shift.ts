import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat4 = ReturnType<typeof getViewMatrix>;

interface Marked {
  view: Mat4;
  viewProjection: Mat4;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // The camera's matrices may be cached storage that is overwritten later,
  // so the mark keeps its own copies.
  let marked: Marked | null = null;

  function snapshot(): Marked {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    return {
      view: getViewMatrix(camera).slice() as Mat4,
      viewProjection: getViewProjectionMatrix(camera, aspect).slice() as Mat4,
    };
  }

  // Both positions are projected onto the canvas as it is now, so a resized
  // canvas or a changed viewport affects them alike and cancels out.
  function currentOptions() {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    return {
      viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
      backingWidth,
      backingHeight,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    };
  }

  function mark(): void {
    marked = snapshot();
  }

  function shift(point: Vec): { dx: number; dy: number } {
    const before = marked!;
    const options = currentOptions();
    const aspect = getEffectiveAspectRatio(camera, options.backingWidth, options.backingHeight);

    const was = projectWorldToScreen(point, before.view, before.viewProjection, options);
    const now = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, aspect), options);

    return { dx: now.cssX - was.cssX, dy: now.cssY - was.cssY };
  }

  mark();
  return { mark, shift };
}
