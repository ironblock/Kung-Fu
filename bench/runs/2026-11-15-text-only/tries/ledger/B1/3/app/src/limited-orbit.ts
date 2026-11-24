import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

// Orbit controls with a zoom range. The distance limits are installed on the
// camera (via setCameraLimits) so the shared radius setter clamps every write,
// including inertia and input applied later in the frame. A per-frame callback
// is not used: onBeforeRender callbacks run before the camera's controls.
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (!(minDistance > 0) || !(maxDistance >= minDistance)) {
    throw new RangeError(
      `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance}..${maxDistance}`,
    );
  }

  setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
  // Bring a camera that starts outside the range inside now, through the setter.
  camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

  // attachControl adds canvas listeners and a scene hook, and returns its own cleanup.
  // disposeScene does not remove the canvas listeners, so we must call this ourselves.
  const detachControls = attachControl(camera, canvas, scene);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    detachControls();
  };
}
