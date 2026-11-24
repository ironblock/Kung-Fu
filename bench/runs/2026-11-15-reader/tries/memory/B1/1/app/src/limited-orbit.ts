import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the camera's usual orbit / wheel / pinch controls to `canvas` and
 * keeps the camera's radius (distance from its orbit target) within
 * [minDistance, maxDistance].
 *
 * The range is enforced in two places:
 *  - the camera's own radius limits, so the camera's input and inertia code
 *    stops at the bounds, and
 *  - a per-frame clamp run before each render, which catches any value that
 *    still ends up outside the range.
 *
 * Returns a function that detaches the controls, removes the per-frame clamp
 * and restores the camera's previous radius limits.
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
    minDistance < 0 ||
    maxDistance < minDistance
  ) {
    throw new RangeError(
      `attachLimitedOrbit: expected 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  const previousLowerLimit = camera.lowerRadiusLimit;
  const previousUpperLimit = camera.upperRadiusLimit;

  const clampRadius = (): void => {
    const radius = camera.radius;
    if (radius < minDistance) {
      camera.radius = minDistance;
    } else if (radius > maxDistance) {
      camera.radius = maxDistance;
    }
  };

  camera.lowerRadiusLimit = minDistance;
  camera.upperRadiusLimit = maxDistance;
  // Bring a camera that starts outside the range inside immediately.
  clampRadius();

  camera.attachControl(canvas);
  const frameObserver = scene.onBeforeRenderObservable.add(clampRadius);

  let detached = false;
  return () => {
    if (detached) {
      return;
    }
    detached = true;
    scene.onBeforeRenderObservable.remove(frameObserver);
    camera.detachControl();
    camera.lowerRadiusLimit = previousLowerLimit;
    camera.upperRadiusLimit = previousUpperLimit;
  };
}
