import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly controls for the free camera: W/A/S/D or arrows to move, mouse to look,
// Space to rise, PageDown to sink. Holding either Shift key multiplies speed by 3.
// Shift is only in fastKeys; it is never in upKeys or downKeys, so holding it
// cannot move the camera vertically on its own.
//
// Both event.code ("Space", "ShiftLeft") and event.key (" ", "Shift") spellings
// are listed so the match works whichever the library compares against.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attaches fly controls to the camera on the given canvas.
 * @returns a function that removes the controls (listeners and per-frame work).
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
