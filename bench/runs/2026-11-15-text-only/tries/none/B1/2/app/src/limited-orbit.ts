import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's default orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera` and keeps its distance from the orbit target
 * within [minDistance, maxDistance] on every frame.
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
    minDistance <= 0 ||
    maxDistance < minDistance
  ) {
    throw new RangeError(
      `attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`,
    );
  }

  const savedLowerLimit = camera.lowerRadiusLimit;
  const savedUpperLimit = camera.upperRadiusLimit;

  // Clamp the radius into range. The negated comparison also maps NaN to minDistance.
  const clampRadius = (): void => {
    const r = camera.radius;
    if (!(r >= minDistance)) {
      camera.radius = minDistance;
    } else if (r > maxDistance) {
      camera.radius = maxDistance;
    }
  };

  // Native limits make the zoom inputs stop at the range; the per-frame clamp
  // below is the guarantee in case an input overshoots (e.g. inertia).
  camera.lowerRadiusLimit = minDistance;
  camera.upperRadiusLimit = maxDistance;

  // Bring a camera that starts outside the range inside immediately.
  clampRadius();

  camera.attachControl(canvas);
  const frameObserver = scene.onBeforeRenderObservable.add(clampRadius);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    scene.onBeforeRenderObservable.remove(frameObserver);
    camera.detachControl();
    camera.lowerRadiusLimit = savedLowerLimit;
    camera.upperRadiusLimit = savedUpperLimit;
  };
}
