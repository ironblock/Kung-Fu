import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's mouse/touch orbit controls to `camera` and keeps the
 * camera's radius (distance from its target) within [minDistance, maxDistance]
 * on every frame, including while zooming with the wheel or pinching.
 *
 * Returns a function that removes the controls and the radius limits, and
 * restores the camera's previous limit fields.
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
      `Invalid distance range: min ${minDistance}, max ${maxDistance}`,
    );
  }

  const previousLower = camera.lowerRadiusLimit;
  const previousUpper = camera.upperRadiusLimit;

  // Radius limits: every radius write from here on is clamped by the library.
  // This also brings a camera that starts outside the range inside it.
  const stopLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  // Explicit clamp so the starting pose is in range even if the library's
  // initial clamp only applies on writes.
  camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

  const stopControls = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    stopControls();
    stopLimits();
    camera.lowerRadiusLimit = previousLower;
    camera.upperRadiusLimit = previousUpper;
  };
}
