import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to `canvas`.
 *
 * - W/A/S/D or arrow keys: move (handled by the library defaults)
 * - Mouse: look around (handled by the library)
 * - Space: rise, PageDown: sink
 * - Shift (left or right): speed multiplier only (x3). Shift is not bound to
 *   any vertical direction, so holding it never moves the camera by itself.
 *
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space", " "],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight", "Shift"],
        fastMultiplier: 3,
    });
}
