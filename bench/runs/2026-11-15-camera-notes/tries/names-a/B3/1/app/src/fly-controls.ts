import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is a speed key only. It is deliberately absent from upKeys and downKeys,
// so holding it (alone or with other keys) cannot raise or lower the camera.
// Both KeyboardEvent.code ("ShiftLeft") and KeyboardEvent.key ("Shift") forms are
// listed so the binding works whichever form the library matches on.
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FAST_MULTIPLIER = 3;

// Space rises, PageDown sinks. " " is the KeyboardEvent.key form of Space.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;

/**
 * Attaches the library's free-camera fly controls to `canvas`:
 * WASD / arrow keys to move, mouse to look, Space to rise, PageDown to sink,
 * and Shift (either side) for 3x speed.
 *
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detach();
    };
}
