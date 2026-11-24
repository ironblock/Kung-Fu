import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

/** A frozen copy of everything needed to project world points as the camera
 *  saw them at one moment. The engine's matrix caches are reused and mutated,
 *  so every matrix and origin is copied. */
interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  origin: Vec | undefined;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  // The camera renders to the whole canvas, so the aspect is the canvas aspect.
  const aspect = backingWidth / backingHeight;

  const view = getViewMatrix(camera).slice() as Mat;
  const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Mat;

  // Under floating origin the matrices are relative to the camera position,
  // so the same origin must be passed when projecting with them.
  let origin: Vec | undefined;
  if (camera._useFloatingOrigin) {
    const p = getCameraPosition(camera);
    origin = { x: p.x, y: p.y, z: p.z };
  }

  return {
    view,
    viewProjection,
    origin,
    backingWidth,
    backingHeight,
    cssWidth: canvas.clientWidth,
    cssHeight: canvas.clientHeight,
  };
}

function projectWith(s: Snapshot, point: Vec): { x: number; y: number } {
  const r = projectWorldToScreen(point, s.view, s.viewProjection, {
    viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
    backingWidth: s.backingWidth,
    backingHeight: s.backingHeight,
    cssWidth: s.cssWidth,
    cssHeight: s.cssHeight,
    ...(s.origin ? { worldOrigin: s.origin } : {}),
  });
  return { x: r.cssX, y: r.cssY };
}

/**
 * Tracks how far world-space points move on the canvas (in CSS pixels) as the
 * camera changes. Marks once on creation; call `mark()` to re-baseline.
 */
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Snapshot = takeSnapshot(camera, canvas);

  return {
    mark(): void {
      marked = takeSnapshot(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      const before = projectWith(marked, point);
      const after = projectWith(takeSnapshot(camera, canvas), point);
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
