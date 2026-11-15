import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera, with a boost key.
 *
 * - W/A/S/D or arrow keys move, mouse drag looks around.
 * - Space rises and PageDown sinks.
 * - Holding either Shift key multiplies movement speed by 3. Shift is only a
 *   speed key here: it is not bound to vertical movement, so holding it never
 *   moves the camera up or down on its own. (The library's default
 *   `attachFreeControl` binds Shift to "down", which is why it is not used.)
 *
 * Returns a cleanup function that removes the canvas listeners and the
 * per-frame update hook registered on the scene.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
