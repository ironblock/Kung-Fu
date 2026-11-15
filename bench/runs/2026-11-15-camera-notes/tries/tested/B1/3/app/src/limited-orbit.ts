import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, with the camera's distance from its
 * target kept within [minDistance, maxDistance].
 *
 * The range is enforced through setCameraLimits, which clamps the current pose
 * immediately and clamps every later radius write, so wheel, pinch and inertia
 * can never leave the range. The returned function removes the controls and
 * the limits and restores the camera's previous radius limit fields.
 */
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
    throw new RangeError(
      `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  const previousLower = camera.lowerRadiusLimit;
  const previousUpper = camera.upperRadiusLimit;

  // Clamps the current radius now and enforces the range on every later write.
  const releaseLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  const detachControls = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    detachControls();
    releaseLimits();

    // Put the radius limit fields back the way we found them.
    if (previousLower === undefined) delete camera.lowerRadiusLimit;
    else camera.lowerRadiusLimit = previousLower;
    if (previousUpper === undefined) delete camera.upperRadiusLimit;
    else camera.upperRadiusLimit = previousUpper;
  };
}
