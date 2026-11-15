import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;
type PixelViewport = ReturnType<typeof resolveCameraViewport>;

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

/**
 * A copy of everything needed to project a world point to CSS pixels as the
 * camera saw it at one instant. The library's matrix getters return cached
 * storage that is reused, so the matrices must be copied here.
 */
interface Frame {
  view: Mat;
  viewProjection: Mat;
  viewport: PixelViewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  /** Set only under floating origin: the world position that is zero in the matrices. */
  origin: Vec | undefined;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Frame {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const origin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;
  return {
    view: getViewMatrix(camera).slice() as Mat,
    viewProjection: getViewProjectionMatrix(camera, aspect).slice() as Mat,
    viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
    backingWidth,
    backingHeight,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
    origin: origin ? { x: origin.x, y: origin.y, z: origin.z } : undefined,
  };
}

function project(frame: Frame, point: Vec) {
  return projectWorldToScreen(point, frame.view, frame.viewProjection, {
    viewport: frame.viewport,
    backingWidth: frame.backingWidth,
    backingHeight: frame.backingHeight,
    cssWidth: frame.cssWidth,
    cssHeight: frame.cssHeight,
    ...(frame.origin ? { worldOrigin: frame.origin } : {}),
  });
}

/**
 * Tracks how far the on-canvas picture of a world-space point moves between the
 * last `mark()` (or creation) and the camera's current state, in CSS pixels.
 * Each side is projected with the camera state it was captured with, so changes
 * to position, orientation, zoom, or field of view all count as motion.
 */
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = capture(camera, canvas);
  return {
    mark() {
      marked = capture(camera, canvas);
    },
    shift(point: Vec) {
      const before = project(marked, point);
      const after = project(capture(camera, canvas), point);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
