import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Shift is only a speed modifier. It is deliberately absent from upKeys and
// downKeys, so holding it never moves the camera vertically on its own.
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * W/A/S/D or arrow keys move, the mouse looks around, Space rises, PageDown
 * sinks, and holding either Shift key moves three times as fast.
 *
 * Returns a function that removes all listeners and per-frame work installed
 * by these controls.
 */
export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: UP_KEYS,
    downKeys: DOWN_KEYS,
    fastKeys: FAST_KEYS,
    fastMultiplier: FAST_MULTIPLIER,
  });
}
