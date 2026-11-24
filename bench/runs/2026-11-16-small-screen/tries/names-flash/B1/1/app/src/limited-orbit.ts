import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  // Normalize the range defensively: swap inverted limits, ignore NaN as no lower
  // limit, and treat Infinity/NaN max as an unlimited upper distance.
  const lowerCandidate = Number.isFinite(minDistance) ? minDistance : 0;
  const upperCandidate = Number.isFinite(maxDistance) ? maxDistance : Number.POSITIVE_INFINITY;

  let lower = Math.min(lowerCandidate, upperCandidate);
  let upper = Math.max(lowerCandidate, upperCandidate);

  // A distance limit should not be negative.
  if (lower < 0) lower = 0;
  if (upper < lower) upper = lower;

  const clampRadius = (radius: number): number => {
    if (Number.isNaN(radius)) return lower;

    let value = radius;
    if (value < lower) value = lower;
    if (Number.isFinite(upper) && value > upper) value = upper;
    return value;
  };

  const isOutOfRange = (radius: number): boolean => {
    if (Number.isNaN(radius)) return true;
    if (radius === Number.POSITIVE_INFINITY) return Number.isFinite(upper);
    if (radius === Number.NEGATIVE_INFINITY) return true;
    return radius < lower || (Number.isFinite(upper) && radius > upper);
  };

  const previousLowerRadiusLimit = camera.lowerRadiusLimit;
  const previousUpperRadiusLimit = camera.upperRadiusLimit;

  const restoreRadiusLimits = (): void => {
    if (previousLowerRadiusLimit === undefined) {
      delete camera.lowerRadiusLimit;
    } else {
      camera.lowerRadiusLimit = previousLowerRadiusLimit;
    }

    if (previousUpperRadiusLimit === undefined) {
      delete camera.upperRadiusLimit;
    } else {
      camera.upperRadiusLimit = previousUpperRadiusLimit;
    }
  };

  let disposeLimits: (() => void) | undefined;
  let disposeControls: (() => void) | undefined;

  try {
    // Use the library's limit mechanism with the scene so it can enforce the
    // radius limits every frame.
    disposeLimits = setCameraLimits(
      camera,
      {
        lowerRadiusLimit: lower,
        upperRadiusLimit: upper,
      },
      scene
    );

    // Also make sure the camera properties themselves carry the limits so the
    // usual controls can see them.
    camera.lowerRadiusLimit = lower;
    camera.upperRadiusLimit = upper;

    // If the library exposes a clamp method, let it apply the newly installed
    // limits immediately.
    camera._clampToLimits?.();

    // If the camera started outside the range, bring it inside right away and
    // stop any radius inertia that would immediately push it back out.
    const initialRadius = camera.radius;
    if (isOutOfRange(initialRadius) || isOutOfRange(camera.radius)) {
      camera.radius = clampRadius(camera.radius);
      camera.inertialRadiusOffset = 0;
    }

    // The requested controls are mouse/touch orbit and zoom only; disable
    // keyboard controls so we do not add unrelated listeners.
    disposeControls = attachControl(camera, canvas, scene, { keyboard: false });
  } catch (setupError) {
    // If control attachment fails after limits were installed, clean up the
    // limit registration before rethrowing.
    try {
      disposeLimits?.();
    } catch (_disposeError) {
      // ignore dispose errors during failed setup
    }

    try {
      restoreRadiusLimits();
    } catch (_restoreError) {
      // ignore cleanup errors during failed setup
    }

    throw setupError;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    try {
      disposeControls?.();
    } finally {
      try {
        disposeLimits?.();
      } finally {
        restoreRadiusLimits();
      }
    }
  };
}
