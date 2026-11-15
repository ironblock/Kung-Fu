import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard + mouse fly controls for a FreeCamera.
 *
 * Uses the configurable free-camera controls rather than `attachFreeControl`, because the
 * default mapping sends both Shift keys to "move down". Here Shift is only a speed key:
 * - W/A/S/D and the arrow keys move
 * - mouse drag looks around
 * - Space rises, PageDown sinks
 * - holding either Shift multiplies movement speed by 3
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
