import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

interface Frame {
  view: Mat;
  viewProjection: Mat;
  // Only set with a floating origin, where the view matrix is camera-relative (notes 63).
  origin: Vec | undefined;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // The library overwrites its matrix caches in place, so each captured matrix must be copied.
  const copy = (m: Mat): Mat => Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;

  const capture = (): Frame => {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    return {
      view: copy(getViewMatrix(camera)),
      viewProjection: copy(getViewProjectionMatrix(camera, aspect)),
      origin: camera._useFloatingOrigin ? { ...getCameraPosition(camera) } : undefined,
    };
  };

  // Both frames are projected onto the canvas as it is now, so a resize affects them equally.
  const project = (frame: Frame, point: Vec) => {
    const w = canvas.width;
    const h = canvas.height;
    return projectWorldToScreen(point, frame.view, frame.viewProjection, {
      viewport: { x: 0, y: 0, width: w, height: h },
      backingWidth: w,
      backingHeight: h,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
      ...(frame.origin ? { worldOrigin: frame.origin } : {}),
    });
  };

  let marked = capture();

  return {
    mark() {
      marked = capture();
    },
    shift(point: Vec) {
      const before = project(marked, point);
      const after = project(capture(), point);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
