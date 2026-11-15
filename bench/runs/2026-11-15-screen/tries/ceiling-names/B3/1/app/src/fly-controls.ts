import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// The declarations only type these as `readonly string[]`, without saying whether they are
// matched against `KeyboardEvent.code` or `KeyboardEvent.key`. Each list therefore carries both
// spellings; the one the library does not use simply never matches.
const UP_KEYS = ["Space", " "] as const; // code "Space", key " "
const DOWN_KEYS = ["PageDown"] as const; // code and key are both "PageDown"
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const; // codes, then key

const FAST_MULTIPLIER = 3;

/**
 * Gives `camera` the library's keyboard + mouse fly controls on `canvas`:
 * W/A/S/D or arrows to move, mouse to look, Space to rise, PageDown to sink,
 * and either Shift to move three times as fast.
 *
 * Shift is passed only as a speed key, and the up/down lists are given explicitly
 * so they do not fall back to library defaults that might include Shift.
 *
 * Returns a function that removes the controls (canvas listeners and per-frame work).
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let detach: (() => void) | null = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });

    return () => {
        // Safe to call more than once.
        if (detach) {
            const d = detach;
            detach = null;
            d();
        }
    };
}
