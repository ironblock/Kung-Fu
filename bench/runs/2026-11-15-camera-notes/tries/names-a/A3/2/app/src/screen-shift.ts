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
type Viewport = ReturnType<typeof resolveCameraViewport>;

// Snapshot of everything needed to project a world point to CSS pixels,
// copied so later camera changes (and any internal caches) cannot alter it.
interface ViewSnapshot {
  view: Mat4;
  viewProjection: Mat4;
  viewport: Viewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function copyMat(m: Mat4): Mat4 {
  return m.slice() as Mat4;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): ViewSnapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const rect = canvas.getBoundingClientRect();
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const vp = resolveCameraViewport(camera, backingWidth, backingHeight);
  return {
    view: copyMat(getViewMatrix(camera)),
    viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
    viewport: { x: vp.x, y: vp.y, width: vp.width, height: vp.height },
    backingWidth,
    backingHeight,
    cssWidth: rect.width,
    cssHeight: rect.height,
  };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = capture(camera, canvas);

  return {
    mark(): void {
      marked = capture(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const now = capture(camera, canvas);
      const before = projectWorldToScreen(point, marked.view, marked.viewProjection, {
        viewport: marked.viewport,
        backingWidth: marked.backingWidth,
        backingHeight: marked.backingHeight,
        cssWidth: marked.cssWidth,
        cssHeight: marked.cssHeight,
      });
      const after = projectWorldToScreen(point, now.view, now.viewProjection, {
        viewport: now.viewport,
        backingWidth: now.backingWidth,
        backingHeight: now.backingHeight,
        cssWidth: now.cssWidth,
        cssHeight: now.cssHeight,
      });
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
