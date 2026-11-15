import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `canvas`,
 * but makes drags turn the camera twice as far as the defaults.
 *
 * Zoom (wheel) is untouched because it is driven by `wheelPrecision`, not by
 * `angularSensibility`.
 *
 * Returns a function that removes the controls and restores the camera's
 * original `angularSensibility`.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  // Capture whatever the camera currently uses so we can restore it later.
  const originalSensibility = camera.angularSensibility;

  // Drag rotation is scaled by angularSensibility. Halving it doubles the
  // rotation for the same mouse movement. This also scales the post-release
  // glide, because the glide is built from the same per-move deltas.
  camera.angularSensibility = originalSensibility / 2;

  let detachControls: (() => void) | null = attachControl(camera, canvas, scene);

  return () => {
    if (detachControls === null) return; // idempotent
    detachControls();
    detachControls = null;
    camera.angularSensibility = originalSensibility;
  };
}
