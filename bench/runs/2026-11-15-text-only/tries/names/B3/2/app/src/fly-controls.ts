import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is a speed modifier only. It is deliberately not listed in upKeys or
// downKeys, so holding it never moves the camera vertically on its own.
const UP_KEYS = ["Space", " "];
const DOWN_KEYS = ["PageDown"];
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"];
const FAST_MULTIPLIER = 3;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to the canvas.
 *
 * W/A/S/D and arrow keys move, the mouse looks around, Space rises and PageDown sinks.
 * Holding either Shift key multiplies movement speed by 3.
 *
 * Returns a function that removes all listeners and per-frame work added by these controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
