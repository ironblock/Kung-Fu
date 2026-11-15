import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches the library's free-camera fly controls to a canvas.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold to move 3x faster. Shift is not bound to
 *   up/down, so holding it never changes altitude by itself.
 *
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
