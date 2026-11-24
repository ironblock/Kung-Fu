import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with orbit drag turning the camera twice as far per pixel of movement.
 *
 * `angularSensibility` is a divisor (higher = slower rotation), so halving it
 * doubles the rotation for the same pointer movement. The drag and inertia
 * (glide) paths both derive from that input, so both are doubled. Wheel zoom,
 * panning, and pinch are not touched.
 *
 * The returned function detaches the library controls (canvas listeners and the
 * per-frame inertia hook) and restores the camera's original sensitivity. It is
 * safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  const originalSensibility = camera.angularSensibility;
  if (!(originalSensibility > 0) || !Number.isFinite(originalSensibility)) {
    throw new Error(`attachFastOrbit: camera.angularSensibility must be a positive finite number, got ${originalSensibility}`);
  }

  const fastSensibility = originalSensibility / 2;
  camera.angularSensibility = fastSensibility;

  const detachControls = attachControl(camera, canvas, scene);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    detachControls();
    // Only restore if nothing else changed the value while the controls were attached.
    if (camera.angularSensibility === fastSensibility) {
      camera.angularSensibility = originalSensibility;
    }
  };
}
