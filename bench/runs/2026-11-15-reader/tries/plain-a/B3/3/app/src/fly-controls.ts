import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for the architecture walkthrough.
 *
 * - W/A/S/D or arrow keys move; mouse drag looks around.
 * - Space rises, PageDown sinks.
 * - Holding either Shift key multiplies movement speed by 3. Shift is a speed key only.
 *
 * The library's default free controls also treat Shift as "sink", so the
 * configurable variant is used with the descend key limited to PageDown.
 *
 * Returns a cleanup function that removes every listener and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
