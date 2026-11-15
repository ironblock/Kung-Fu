import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Attaches the library's standard arc-rotate mouse and touch controls to the canvas and keeps
// camera.radius (the distance from the orbit target) inside [minDistance, maxDistance].
//
// The limit is enforced by the camera's own setter clamp (installed by setCameraLimits), not by a
// per-frame hook. The ledger notes that a hook added with onBeforeRender goes to the head of the
// scene's per-frame list, so it would run before the camera's controls and could see a radius
// that is one frame out of range. Clamping on every radius write avoids that and leaves no
// per-frame work of our own behind.
//
// Returns a function that removes the controls. It is the detach function attachControl returns.
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance < 0 || maxDistance < minDistance) {
    throw new RangeError(`attachLimitedOrbit: need 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
  }

  // Install the radius limits first so every later write to camera.radius goes through the clamp.
  setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });

  // Bring a camera that starts outside the range inside now, not on the first frame.
  camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

  // The library's controls handle drag, wheel and pinch. Their radius writes go through the clamp above.
  const detach = attachControl(camera, canvas, scene);

  return detach;
}
