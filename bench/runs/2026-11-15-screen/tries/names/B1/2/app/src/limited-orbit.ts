import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the orbit distance (radius) constrained to
 * [minDistance, maxDistance].
 *
 * Returns a function that removes the controls and the radius limits.
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
      `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  // If the camera starts outside the range, bring it inside now. Any pending
  // radial inertia is dropped so it cannot push the camera back out.
  const radius = camera.radius;
  if (!(radius >= minDistance && radius <= maxDistance)) {
    camera.radius = Number.isNaN(radius)
      ? minDistance
      : Math.min(maxDistance, Math.max(minDistance, radius));
    camera.inertialRadiusOffset = 0;
  }

  const detachControls = attachControl(camera, canvas, scene);

  let detachLimits: () => void;
  try {
    detachLimits = setCameraLimits(
      camera,
      { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
      scene,
    );
  } catch (err) {
    detachControls();
    throw err;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detachLimits();
    detachControls();
  };
}
