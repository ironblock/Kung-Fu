import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold to move three times as fast
 *
 * attachFreeControl is not used because it also maps Shift to moving down. The configurable
 * variant lets Shift be a speed key only, by removing it from the down keys.
 *
 * Returns a function that removes the listeners from the canvas and the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space", "PageUp"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
