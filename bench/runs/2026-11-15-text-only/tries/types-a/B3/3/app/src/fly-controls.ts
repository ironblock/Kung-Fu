import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attach fly-through keyboard and mouse controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move (library defaults).
 * - Mouse drag: look around (library default).
 * - Space: rise. PageDown: sink.
 * - Shift (left or right): speed boost, 3x. Shift is not bound to vertical
 *   movement here. The stock attachFreeControl maps Shift to "down", so the
 *   key lists are passed explicitly to avoid that.
 *
 * Returns the library's cleanup function, which removes the canvas listeners
 * and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
