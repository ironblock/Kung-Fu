import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Key codes (KeyboardEvent.code). Shift is listed only as a speed key, never as
// an up/down key. upKeys/downKeys replace the library defaults, so Shift cannot
// pick up a default vertical binding.
const FLY_UP_KEYS = ["Space"] as const;
const FLY_DOWN_KEYS = ["PageDown"] as const;
const FLY_FAST_KEYS = ["ShiftLeft", "ShiftRight"] as const;
const FLY_FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * W/A/S/D or arrow keys move, the mouse looks around, Space rises, PageDown sinks,
 * and holding either Shift key moves three times as fast.
 *
 * Returns a function that removes the controls (canvas listeners and per-frame work).
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: FLY_UP_KEYS,
        downKeys: FLY_DOWN_KEYS,
        fastKeys: FLY_FAST_KEYS,
        fastMultiplier: FLY_FAST_MULTIPLIER,
    });
}
