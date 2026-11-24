import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, keeping the camera's radius (its
 * distance from the orbit target) within [minDistance, maxDistance].
 *
 * The radius range is enforced by setCameraLimits, which clamps the current
 * pose immediately and clamps every later radius write, including wheel and
 * pinch zoom. Returns a function that removes the controls and the limits.
 */
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (
    !Number.isFinite(minDistance) ||
    !Number.isFinite(maxDistance) ||
    minDistance <= 0 ||
    maxDistance < minDistance
  ) {
    throw new RangeError(
      `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  // Set the limits first so that a camera starting outside the range is
  // brought inside before any input is handled.
  const releaseLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  let releaseControls: () => void;
  try {
    releaseControls = attachControl(camera, canvas, scene);
  } catch (error) {
    releaseLimits();
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    // Stop input first, then remove the radius limit.
    releaseControls();
    releaseLimits();
  };
}
