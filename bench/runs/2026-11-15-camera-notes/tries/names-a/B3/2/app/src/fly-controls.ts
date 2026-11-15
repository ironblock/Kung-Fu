import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Shift is a speed modifier only. It is deliberately absent from upKeys and
// downKeys, so holding it (alone or with other keys) never moves the camera
// vertically. Space rises and PageDown sinks.
const FLY_UP_KEYS = ["Space"] as const;
const FLY_DOWN_KEYS = ["PageDown"] as const;
const FLY_FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FLY_FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (either side): move three times as fast
 *
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: FLY_UP_KEYS,
    downKeys: FLY_DOWN_KEYS,
    fastKeys: FLY_FAST_KEYS,
    fastMultiplier: FLY_FAST_MULTIPLIER,
  });
}
