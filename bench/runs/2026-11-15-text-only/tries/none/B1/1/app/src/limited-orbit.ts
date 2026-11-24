import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls to `camera` and keeps its
 * radius (distance from the orbit target) within [minDistance, maxDistance].
 *
 * The limits are set on the camera so wheel and pinch input stop at the bounds,
 * and a per-frame clamp catches anything that overshoots (inertia, other code
 * writing `radius`). If the camera starts outside the range it is moved inside
 * immediately.
 *
 * Returns a function that detaches the controls, removes the per-frame clamp,
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
    minDistance > maxDistance
  ) {
    throw new RangeError(
      `attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`,
    );
  }

  const previousLower = camera.lowerRadiusLimit;
  const previousUpper = camera.upperRadiusLimit;

  // NaN fails `>= minDistance`, so it is also pulled back into range.
  const clampRadius = (): void => {
    const r = camera.radius;
    if (!(r >= minDistance)) {
      camera.radius = minDistance;
    } else if (r > maxDistance) {
      camera.radius = maxDistance;
    }
  };

  camera.lowerRadiusLimit = minDistance;
  camera.upperRadiusLimit = maxDistance;
  clampRadius();

  camera.attachControl(canvas);
  const observer = scene.onBeforeRenderObservable.add(clampRadius);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    scene.onBeforeRenderObservable.remove(observer);
    camera.detachControl();
    camera.lowerRadiusLimit = previousLower;
    camera.upperRadiusLimit = previousUpper;
  };
}
