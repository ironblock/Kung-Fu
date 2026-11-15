import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Gives an ArcRotateCamera the library's mouse and touch orbit/zoom controls,
 * with the camera distance (radius) kept between minDistance and maxDistance.
 *
 * Range enforcement uses the library's own limit hook: the lower/upper radius
 * fields are set, then setCameraLimits installs the hook that clamps the radius
 * from the camera's setters. The hook is removed by the returned function.
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
    minDistance > maxDistance
  ) {
    throw new RangeError(
      `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  camera.lowerRadiusLimit = minDistance;
  camera.upperRadiusLimit = maxDistance;
  const removeLimits = setCameraLimits(camera, scene);

  let detachControls: () => void;
  try {
    detachControls = attachControl(camera, canvas, scene);
  } catch (err) {
    removeLimits();
    throw err;
  }

  // Bring a camera that starts outside the range inside now. Assigning through
  // the radius setter runs the installed clamp hook.
  const clamped = Math.min(maxDistance, Math.max(minDistance, camera.radius));
  if (clamped !== camera.radius) {
    camera.radius = clamped;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detachControls();
    removeLimits();
  };
}
