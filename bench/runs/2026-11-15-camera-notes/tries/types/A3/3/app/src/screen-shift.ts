import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

/** A camera pose frozen at one instant. */
interface Frame {
  view: Mat;
  viewProjection: Mat;
  /** Set under floating origin: the matrices are relative to this world position. */
  origin: Vec | undefined;
}

function originOf(camera: Camera): Vec | undefined {
  if (camera._useFloatingOrigin !== true) return undefined;
  const p = getCameraPosition(camera);
  return { x: p.x, y: p.y, z: p.z };
}

/** The camera's matrix caches are reused and rewritten in place, so a stored frame needs its own copy. */
function copyMat(m: Mat): Mat {
  return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked: Frame | undefined;

  // Pose as the camera is right now (may alias the camera's caches).
  const current = (): Frame => ({
    view: getViewMatrix(camera),
    viewProjection: getViewProjectionMatrix(
      camera,
      getEffectiveAspectRatio(camera, canvas.width, canvas.height),
    ),
    origin: originOf(camera),
  });

  // Project a world point through a frame, onto the canvas as it is now (CSS pixels).
  const screenOf = (point: Vec, frame: Frame) => {
    const rect = canvas.getBoundingClientRect();
    return projectWorldToScreen(point, frame.view, frame.viewProjection, {
      viewport: resolveCameraViewport(camera, canvas.width, canvas.height),
      backingWidth: canvas.width,
      backingHeight: canvas.height,
      cssWidth: rect.width,
      cssHeight: rect.height,
      ...(frame.origin ? { worldOrigin: frame.origin } : {}),
    });
  };

  const mark = (): void => {
    const f = current();
    marked = {
      view: copyMat(f.view),
      viewProjection: copyMat(f.viewProjection),
      origin: f.origin,
    };
  };

  mark();

  return {
    mark,
    shift(point: Vec) {
      if (marked === undefined) throw new Error("screen-shift: no mark");
      const now = current();
      const before = screenOf(point, marked);
      const after = screenOf(point, now);
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
