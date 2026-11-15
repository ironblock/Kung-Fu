import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Speed multiplier while Shift (left or right) is held. */
const BOOST_MULTIPLIER = 3;

/**
 * Attach fly controls to a free camera on the given canvas.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): three times the movement speed. Shift is only a speed key here;
 *   it never moves the camera vertically.
 *
 * The library's default mapping sends Shift to "down" and PageUp to "up", so the key sets are
 * overridden explicitly.
 *
 * Returns a cleanup function that removes all canvas listeners and the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: BOOST_MULTIPLIER,
    });
}
