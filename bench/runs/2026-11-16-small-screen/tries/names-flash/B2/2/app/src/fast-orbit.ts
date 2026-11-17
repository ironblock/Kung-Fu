import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard pointer controls for an arc-rotate camera,
 * but makes pointer-driven orbiting twice as far, including the inertial glide
 * after the pointer is released.
 *
 * Wheel zoom and panning are left at the library defaults: this code only
 * changes `angularSensibility` and does not touch `wheelPrecision`,
 * `panningSensibility`, or the radius/panning inertial offsets.
 *
 * Keyboard controls are disabled because the request is specifically for mouse
 * and touch controls.
 *
 * Assumption: Babylon Lite's `angularSensibility` behaves like BabylonJS's
 * classic arc-rotate sensibility: a larger value means slower rotation, so
 * halving it doubles drag rotation and inertial offsets. If Lite instead treats
 * it as a direct multiplier, `makeFasterSensibility` should multiply by 2
 * instead of dividing by 2.
 */
export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalAngularSensibility = camera.angularSensibility;
  const fastAngularSensibility = makeFasterSensibility(originalAngularSensibility);

  camera.angularSensibility = fastAngularSensibility;

  let disposeControls: () => void;
  try {
    disposeControls = attachControl(camera, canvas, scene, {
      keyboard: false,
    });
  } catch (error) {
    camera.angularSensibility = originalAngularSensibility;
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    try {
      disposeControls();
    } finally {
      camera.angularSensibility = originalAngularSensibility;
    }
  };
}

function makeFasterSensibility(value: number): number {
  // If the value is zero/non-finite, there is no well-defined way to make it
  // "twice as fast" without changing the library's edge-case behavior, so
  // leave it unchanged.
  if (!Number.isFinite(value) || value === 0) {
    return value;
  }

  return value / DRAG_SPEED_FACTOR;
}
