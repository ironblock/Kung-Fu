import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera` and keeps `camera.radius` within
 * [minDistance, maxDistance].
 *
 * Enforcement is two-layered:
 *  - the camera's own radius limits are set, so the controller clamps zoom
 *    inside its update step, and
 *  - a per-frame guard clamps `camera.radius` again as a backstop.
 *
 * Returns a function that detaches the controls, stops the per-frame guard
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

  // scene is part of the public signature; the per-frame guard below runs on
  // requestAnimationFrame so it does not depend on any scene hook.
  void scene;

  const clampRadius = (radius: number): number => {
    if (!Number.isFinite(radius)) return minDistance;
    return Math.min(maxDistance, Math.max(minDistance, radius));
  };

  const savedLower = camera.lowerRadiusLimit;
  const savedUpper = camera.upperRadiusLimit;

  camera.lowerRadiusLimit = minDistance;
  camera.upperRadiusLimit = maxDistance;

  // A camera that starts outside the range is brought inside immediately.
  camera.radius = clampRadius(camera.radius);

  camera.attachControl(canvas, true);

  let running = true;
  let frameId = 0;
  const guard = (): void => {
    if (!running) return;
    const radius = camera.radius;
    const clamped = clampRadius(radius);
    if (clamped !== radius) {
      camera.radius = clamped;
    }
    frameId = requestAnimationFrame(guard);
  };
  frameId = requestAnimationFrame(guard);

  let disposed = false;
  return (): void => {
    if (disposed) return;
    disposed = true;
    running = false;
    cancelAnimationFrame(frameId);
    camera.detachControl();
    camera.lowerRadiusLimit = savedLower;
    camera.upperRadiusLimit = savedUpper;
  };
}
