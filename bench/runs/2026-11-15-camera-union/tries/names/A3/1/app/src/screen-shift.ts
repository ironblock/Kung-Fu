import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

interface Snapshot {
  // Copies, not references: the library may reuse its cached matrix storage.
  view: Mat;
  viewProjection: Mat;
  viewport: ReturnType<typeof resolveCameraViewport>;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  return {
    view: structuredClone(getViewMatrix(camera)),
    viewProjection: structuredClone(getViewProjectionMatrix(camera, aspect)),
    viewport: { ...resolveCameraViewport(camera, backingWidth, backingHeight) },
    backingWidth,
    backingHeight,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
  };
}

function project(s: Snapshot, point: Vec) {
  return projectWorldToScreen(point, s.view, s.viewProjection, {
    viewport: s.viewport,
    backingWidth: s.backingWidth,
    backingHeight: s.backingHeight,
    cssWidth: s.cssWidth,
    cssHeight: s.cssHeight,
  });
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = capture(camera, canvas);
  return {
    mark() {
      marked = capture(camera, canvas);
    },
    shift(point: Vec) {
      const now = capture(camera, canvas);
      const before = project(marked, point);
      const after = project(now, point);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
