import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// attachFreeControl and the default attachConfigurableFreeControl treat Shift as a
// "move down" key. This viewer uses Shift only as a speed key, so the down keys are
// replaced with PageDown alone and Shift is listed as a fast key.
const UP_KEYS = ["Space", "PageUp"];
const DOWN_KEYS = ["PageDown"];
const BOOST_KEYS = ["ShiftLeft", "ShiftRight"];
const BOOST_MULTIPLIER = 3;

/**
 * Attach the library's keyboard and mouse fly controls to a free camera.
 * W/A/S/D or arrow keys move, drag with the mouse to look, Space rises, PageDown sinks,
 * and holding either Shift runs three times as fast.
 * Returns a function that removes the listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: BOOST_KEYS,
        fastMultiplier: BOOST_MULTIPLIER,
    });
}
