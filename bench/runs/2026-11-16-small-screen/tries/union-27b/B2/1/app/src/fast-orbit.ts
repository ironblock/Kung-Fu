import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the standard Babylon Lite arc-rotate mouse/touch controls to the
 * canvas, but makes pointer drags rotate the camera twice as far as the
 * default controls would for the same pointer movement. The inertial glide
 * after release is affected too, because it is driven by the same inertial
 * offsets. Wheel zoom is left unchanged.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const original = camera.angularSensibility;

  // The standard rotate drag adds dx / angularSensibility to the inertial
  // offset. Halving the sensitivity therefore doubles the turn per pixel.
  const fast = original / 2;
  camera.angularSensibility =
    Number.isFinite(fast) && fast !== 0 ? fast : original;

  let disposeControl: (() => void) | undefined;
  try {
    disposeControl = attachControl(camera, canvas, scene, {
      keyboard: false,
    });
  } catch (error) {
    camera.angularSensibility = original;
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    disposeControl?.();
    camera.angularSensibility = original;
  };
}
