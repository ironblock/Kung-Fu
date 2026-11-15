import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is a speed modifier only. It is deliberately not listed in UP_KEYS or
// DOWN_KEYS, so holding it (alone or with other keys) never moves the camera
// vertically. Both key-name forms are listed for Shift and Space so matching
// works whether the library compares KeyboardEvent.code or KeyboardEvent.key.
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 * W/A/S/D and arrow keys move, the mouse looks around, Space rises,
 * PageDown sinks, and holding either Shift key moves 3x as fast.
 *
 * Returns a disposer that removes the canvas/keyboard listeners and the
 * per-frame update registered by the library.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
