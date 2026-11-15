import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How many times further a drag turns the camera than the library default. */
const ROTATION_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse/touch controls, with
 * drag rotation (and its inertial glide) running at twice the default speed.
 *
 * The library turns the camera by `pixelDelta / angularSensibility` (a larger
 * value is slower), and the glide after release decays that same per-move
 * offset, so halving `angularSensibility` doubles both the drag and the glide.
 * Wheel zoom (`wheelPrecision`) and panning (`panningSensibility`) are
 * untouched.
 *
 * Returns a function that detaches the controls and restores the camera's
 * original `angularSensibility`.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalSensibility = camera.angularSensibility;
  const fastSensibility = originalSensibility / ROTATION_SPEED_FACTOR;
  camera.angularSensibility = fastSensibility;

  const detach = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detach();
    // Only restore if nobody else changed the value in the meantime.
    if (camera.angularSensibility === fastSensibility) {
      camera.angularSensibility = originalSensibility;
    }
  };
}
