import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Key names are listed in both `event.code` and `event.key` spellings so the
// bindings work whichever form the library matches against.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
// Shift is a speed modifier only. It is deliberately absent from UP_KEYS and
// DOWN_KEYS, so holding it never produces vertical movement on its own.
const FAST_KEYS = ["Shift", "ShiftLeft", "ShiftRight"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to `canvas`.
 *
 * - W/A/S/D or arrow keys: move (library defaults)
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (either side): move three times as fast
 *
 * Returns a function that removes the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
