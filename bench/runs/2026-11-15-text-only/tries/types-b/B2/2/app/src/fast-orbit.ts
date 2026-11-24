import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * How many times farther a drag turns the camera than the library default.
 * `angularSensibility` is a divisor (higher = slower), so dividing it by the
 * gain makes each mouse movement produce gain-times the rotation. Inertia is
 * built from the same input offsets, so the post-release glide scales too.
 */
const DRAG_GAIN = 2;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`,
 * with orbit drag sped up by {@link DRAG_GAIN}. Wheel zoom and pan are untouched.
 *
 * @returns A cleanup function that detaches the controls and restores the
 * camera's original `angularSensibility`. Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  const originalSensibility = camera.angularSensibility;
  const fastSensibility = originalSensibility / DRAG_GAIN;
  camera.angularSensibility = fastSensibility;

  const detachControls = attachControl(camera, canvas, scene);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    detachControls();
    // Only restore if nobody changed the sensitivity while the controls were attached.
    if (camera.angularSensibility === fastSensibility) {
      camera.angularSensibility = originalSensibility;
    }
  };
}
