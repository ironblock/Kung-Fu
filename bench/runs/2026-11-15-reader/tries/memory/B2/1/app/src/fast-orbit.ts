import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * How much farther a drag turns the camera than the library default.
 * The library's angular sensibility is "movement divisor": a larger value
 * means less movement per pixel. Dividing it by 2 doubles the turn for the
 * same mouse or touch movement. The inertia (glide) is built from the same
 * scaled input, so it doubles too.
 */
const DRAG_GAIN = 2;

/**
 * Attaches the library's standard mouse and touch controls to an orbit camera,
 * with drag turning the camera DRAG_GAIN times farther. Wheel zoom is untouched.
 *
 * Returns a function that detaches the controls and restores the original
 * sensibility. It adds no per-frame callbacks and no extra canvas listeners.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  void scene; // not needed for the sensibility approach; kept to match the public signature

  const originalX = camera.angularSensibilityX;
  const originalY = camera.angularSensibilityY;

  camera.angularSensibilityX = originalX / DRAG_GAIN;
  camera.angularSensibilityY = originalY / DRAG_GAIN;
  camera.attachControl(canvas, true);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    camera.detachControl();
    camera.angularSensibilityX = originalX;
    camera.angularSensibilityY = originalY;
  };
}
