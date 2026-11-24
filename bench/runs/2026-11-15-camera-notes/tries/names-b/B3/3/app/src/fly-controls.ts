import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches the library's keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D and arrow keys move the camera (handled by the library).
 * - Mouse drag looks around (handled by the library).
 * - Space rises, PageDown sinks.
 * - Either Shift key multiplies movement speed by 3. Shift is only a speed
 *   key: it is not in the up/down lists, so holding it never moves the camera
 *   vertically on its own.
 *
 * Key names use KeyboardEvent.code values.
 *
 * Returns a disposer that removes all listeners and per-frame work.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
