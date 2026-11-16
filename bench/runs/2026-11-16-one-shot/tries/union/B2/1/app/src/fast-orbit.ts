import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard mouse and touch controls to an arc-rotate
 * camera, with drag rotation at twice the library's default speed.
 *
 * A rotate drag adds dx / angularSensibility to the alpha offset (and dy to
 * beta), and the glide after release is proportional to that offset. Halving
 * angularSensibility while the controls are attached therefore doubles both
 * the drag and the glide. Wheel zoom and pinch do not use angularSensibility,
 * so they are unchanged.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angularSensibility. Calling it more than once is harmless.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const originalSensibility = camera.angularSensibility;

  // Set before attaching, so the change applies whether the controls read
  // the value per event or when they are attached.
  camera.angularSensibility = originalSensibility / 2;

  let detach: (() => void) | undefined;
  try {
    detach = attachControl(camera, canvas, scene);
  } catch (error) {
    camera.angularSensibility = originalSensibility;
    throw error;
  }

  return () => {
    if (!detach) {
      return;
    }
    detach();
    detach = undefined;
    camera.angularSensibility = originalSensibility;
  };
}
