import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much faster a drag turns the camera than the library default. */
const ORBIT_SPEED_FACTOR = 2;

/**
 * Attach the library's standard arc-rotate mouse/touch controls, with drag
 * rotation (and therefore its inertial glide) twice as fast as the default.
 *
 * `angularSensibility` is a divisor (HIGHER = slower), and drag input is
 * accumulated into `inertialAlphaOffset` / `inertialBetaOffset` from it, so
 * halving it doubles both the direct turn and the glide that follows release,
 * for both axes. Wheel zoom (`wheelPrecision`) and panning
 * (`panningSensibility`) are left untouched.
 *
 * No per-frame code of our own is installed; the only per-frame hook is the
 * library's inertia hook, which the library's own disposer removes.
 *
 * @returns A disposer that detaches the controls and restores the camera's
 * original `angularSensibility`. Safe to call more than once.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalSensibility = camera.angularSensibility;
  const fastSensibility = originalSensibility / ORBIT_SPEED_FACTOR;

  // Set before attaching, in case the controls read the value at attach time.
  camera.angularSensibility = fastSensibility;
  const detach = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detach();
    // Only restore if nobody else has changed it in the meantime.
    if (camera.angularSensibility === fastSensibility) {
      camera.angularSensibility = originalSensibility;
    }
  };
}
