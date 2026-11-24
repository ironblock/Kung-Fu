import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (
    !(Number.isFinite(minDistance) && Number.isFinite(maxDistance) &&
      minDistance > 0 && minDistance <= maxDistance)
  ) {
    throw new RangeError(
      `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  // Bring the camera inside the range immediately.
  camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

  // Enforce the range through the library's own radius limits, so wheel, pinch,
  // and inertia all stop at the bounds.
  const releaseLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  // Default mouse and touch controls (orbit, wheel zoom, pinch zoom).
  const detachControls = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detachControls();
    releaseLimits();
  };
}
