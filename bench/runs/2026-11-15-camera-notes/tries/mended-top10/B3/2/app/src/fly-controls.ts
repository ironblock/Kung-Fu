import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is only a speed key. It is deliberately absent from upKeys and downKeys,
// so holding it (alone or with other keys) never moves the camera vertically.
// Both key-code and key-value spellings are listed so the match works either way.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 * W/A/S/D and the arrow keys move, the mouse looks, Space rises, PageDown sinks,
 * and Shift (either side) moves three times as fast.
 *
 * Returns a function that removes the controls. It only calls the library's
 * own disposer, so nothing of ours is left listening or running per frame.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
