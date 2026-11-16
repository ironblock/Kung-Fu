import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is listed only as a fast key. It is not in upKeys or downKeys,
// so holding it by itself never moves the camera vertically.
const FAST_MULTIPLIER = 3;

/**
 * Attaches the library's free-camera fly controls to a canvas.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag: look around
 * - Space: rise, PageDown: sink
 * - Left or right Shift: move three times as fast
 *
 * The returned function removes every listener the library added and stops
 * its per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
