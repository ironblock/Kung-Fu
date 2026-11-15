import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera.
 *
 * - W/A/S/D or arrow keys move; mouse drag looks around.
 * - Space rises, PageDown sinks.
 * - Left or right Shift multiplies movement speed by 3. Shift is not a vertical key here:
 *   the library's default free controls map Shift to "down", so the key lists are set explicitly.
 *
 * Returns a cleanup function that removes the canvas listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
