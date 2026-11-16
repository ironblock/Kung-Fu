import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;

// Everything needed to place a world point on the canvas as the camera was at one moment.
interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  origin: Vec | undefined; // set only under floating origin, see camera-notes.md note 63
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  aspect: number;
}

// The library returns its own cache objects, overwritten on the next change, so copy them.
function copyMatrix(m: Mat): Mat {
  const src = m as unknown as ArrayLike<number>;
  const out = new Float64Array(16);
  for (let i = 0; i < 16; i++) out[i] = src[i];
  return out as unknown as Mat;
}

function capture(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  // View first, then view-projection: both refresh their caches for the current camera state.
  const view = copyMatrix(getViewMatrix(camera));
  const viewProjection = copyMatrix(getViewProjectionMatrix(camera, aspect));
  const origin = camera._useFloatingOrigin ? { ...getCameraPosition(camera) } : undefined;
  return { view, viewProjection, origin, backingWidth, backingHeight, cssWidth, cssHeight, aspect };
}

// Returns the point's canvas position in CSS pixels, or null if it is behind the camera.
function project(point: Vec, s: Snapshot): { x: number; y: number } | null {
  const r = projectWorldToScreen(point, s.view, s.viewProjection, {
    viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
    backingWidth: s.backingWidth,
    backingHeight: s.backingHeight,
    cssWidth: s.cssWidth,
    cssHeight: s.cssHeight,
    ...(s.origin ? { worldOrigin: s.origin } : {}),
  });
  if (r.behindCamera) return null;
  return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let saved = capture(camera, canvas);

  return {
    mark() {
      saved = capture(camera, canvas);
    },
    shift(point: Vec) {
      const now = capture(camera, canvas);
      const before = project(point, saved);
      const after = project(point, now);
      if (!before || !after) return { dx: NaN, dy: NaN };
      return { dx: after.x - before.x, dy: after.y - before.y };
    },
  };
}
