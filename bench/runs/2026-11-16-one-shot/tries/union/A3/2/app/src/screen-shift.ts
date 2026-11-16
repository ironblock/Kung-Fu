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

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

interface Snapshot {
  view: Mat;
  viewProjection: Mat;
  origin: Vec | undefined;
}

// The camera's getViewMatrix / getViewProjectionMatrix return its own cache,
// overwritten in place on the next change, so each value is copied when taken.
function copyMatrix(m: Mat): Mat {
  const src = m as unknown as ArrayLike<number>;
  const out = new Float64Array(16);
  for (let i = 0; i < 16; i++) out[i] = src[i];
  return out as unknown as Mat;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  const capture = (): Snapshot => {
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
    const view = copyMatrix(getViewMatrix(camera));
    const viewProjection = copyMatrix(getViewProjectionMatrix(camera, aspect));
    // With a floating origin the matrices are camera-relative, so the
    // projection needs the camera's world position as its origin.
    const pos = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;
    const origin = pos ? { x: pos.x, y: pos.y, z: pos.z } : undefined;
    return { view, viewProjection, origin };
  };

  let snap = capture();

  return {
    mark() {
      snap = capture();
    },
    shift(point) {
      const now = capture();
      const viewport = resolveCameraViewport(camera, canvas.width, canvas.height);
      const rect = canvas.getBoundingClientRect();
      const options = (origin: Vec | undefined) => ({
        viewport,
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        cssWidth: rect.width,
        cssHeight: rect.height,
        ...(origin ? { worldOrigin: origin } : {}),
      });

      // Both positions are expressed on the canvas as it is now, so only the
      // camera matrices differ between the two projections.
      const before = projectWorldToScreen(point, snap.view, snap.viewProjection, options(snap.origin));
      const after = projectWorldToScreen(point, now.view, now.viewProjection, options(now.origin));

      if (before.behindCamera || after.behindCamera) {
        return { dx: NaN, dy: NaN };
      }
      return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    },
  };
}
