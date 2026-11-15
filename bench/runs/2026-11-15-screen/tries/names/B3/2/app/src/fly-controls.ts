import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

const FAST_MULTIPLIER = 3;

/**
 * Attaches the library's free-camera fly controls to a canvas.
 *
 * - W/A/S/D or arrow keys: move (library defaults)
 * - Mouse: look around (library defaults)
 * - Space: rise, PageDown: sink
 * - Left or right Shift: 3x speed only. Shift is not mapped to up or down.
 *
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    // Both KeyboardEvent.code ("Space") and KeyboardEvent.key (" ") forms are
    // listed in case the library matches on either one.
    upKeys: ["Space", " "],
    downKeys: ["PageDown"],
    // Shift only scales speed. It never appears in upKeys or downKeys.
    fastKeys: ["ShiftLeft", "ShiftRight", "Shift"],
    fastMultiplier: FAST_MULTIPLIER,
  });
}
