import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag: look around
 * - Space: rise, PageDown: sink
 * - Left or right Shift: hold to move three times as fast (speed only; never vertical)
 *
 * The library's default vertical mapping puts Shift on "down", so the up/down
 * keys are set explicitly here and Shift is only used as a speed key.
 *
 * Returns a cleanup function that removes the canvas listeners and the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
