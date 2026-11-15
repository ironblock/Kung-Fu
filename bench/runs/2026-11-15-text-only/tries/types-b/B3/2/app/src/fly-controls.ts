import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attach keyboard and mouse fly controls to a FreeCamera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold to move 3x as fast; Shift never moves the camera vertically
 *
 * Shift is removed from the library's default down-keys (ShiftLeft, ShiftRight, PageDown),
 * because the library would otherwise sink the camera whenever Shift is held.
 *
 * @returns Cleanup function that removes the canvas listeners and per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: ["Space"],
    downKeys: ["PageDown"],
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });
}
