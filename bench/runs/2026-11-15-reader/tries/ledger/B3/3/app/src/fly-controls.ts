import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a free camera.
 *
 * W/A/S/D or the arrow keys move, the mouse looks around, Space rises and PageDown sinks.
 * Either Shift key multiplies movement speed by 3 while held.
 *
 * The library's default `attachFreeControl` maps both Shift keys to "down", so this uses
 * `attachConfigurableFreeControl` with the key lists set explicitly. Shift appears only in
 * `fastKeys`, so holding it never changes the vertical movement.
 *
 * Returns a cleanup function that removes the canvas listeners and the per-frame hook.
 * Do not call it from inside an `onBeforeRender` callback: the scene walks that list with
 * `for...of` and removing an entry mid-walk skips the next callback once.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
