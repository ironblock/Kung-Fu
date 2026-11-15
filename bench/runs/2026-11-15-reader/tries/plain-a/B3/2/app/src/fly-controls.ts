import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Speed multiplier applied while a Shift key is held. */
const BOOST_MULTIPLIER = 3;

/**
 * Attach keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag: look around
 * - Space: rise, PageDown: sink
 * - Left or right Shift: move three times as fast. Shift is a speed key only and never moves the camera vertically.
 *
 * Returns a cleanup function that removes the canvas listeners and the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: BOOST_MULTIPLIER,
    });
}
