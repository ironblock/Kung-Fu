import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate pointer controls, but makes
 * rotation drags twice as far as the default.
 *
 * The library's camera controls are expected to read `angularSensibility`
 * as an inverse sensitivity value (larger = slower). Halving it doubles the
 * rotation delta for the same pointer movement, including the inertia/glide
 * after pointerup.
 *
 * Wheel zooming and panning are left untouched: we do not modify
 * `wheelPrecision` or `panningSensibility`.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalSensibility = camera.angularSensibility;
  const fastSensibility =
    originalSensibility === 0 ? originalSensibility : originalSensibility / 2;

  // Set the faster sensitivity before attaching the controls so the controls
  // see the adjusted value whether they read it once during attach or read it
  // live during pointer events.
  camera.angularSensibility = fastSensibility;

  let disposeControls: (() => void) | undefined;

  try {
    // Keyboard controls are intentionally disabled: the requested behavior is
    // the standard mouse/touch controls only.
    disposeControls = attachControl(camera, canvas, scene, { keyboard: false });
  } catch (error) {
    camera.angularSensibility = originalSensibility;
    throw error;
  }

  let disposed = false;

  return () => {
    if (disposed) return;
    disposed = true;

    try {
      disposeControls?.();
    } finally {
      camera.angularSensibility = originalSensibility;
    }
  };
}
