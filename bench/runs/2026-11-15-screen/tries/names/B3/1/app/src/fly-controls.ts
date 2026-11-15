import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is a speed key only. It is deliberately absent from upKeys and downKeys,
// so holding Shift (with or without other keys) never moves the camera vertically.
// Both KeyboardEvent.code ("ShiftLeft") and KeyboardEvent.key ("Shift") forms are
// listed, and Space is listed as both code ("Space") and key (" "), so the
// binding works whichever form the library matches on.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to `canvas`.
 * W/A/S/D and the arrow keys move, the mouse looks around, Space rises, PageDown
 * sinks, and either Shift key multiplies speed by 3.
 *
 * Returns a function that removes the controls. It removes the canvas listeners
 * and the per-frame hook that the library installed.
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
