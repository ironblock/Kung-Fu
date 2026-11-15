import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Speed multiplier applied while either Shift key is held. */
const BOOST_MULTIPLIER = 3;

// The library's default free-camera mapping uses Shift as a "move down" key.
// attachConfigurableFreeControl lets us replace the vertical mappings, so Shift
// is removed from them entirely and used only as a speed-boost key.
//
// The notes do not say whether these lists are matched against
// KeyboardEvent.code or KeyboardEvent.key, so each list names both forms.
// An entry in the form the library does not use simply never matches.
const UP_KEYS = ["Space", " "] as const; // code "Space" / key " "
const DOWN_KEYS = ["PageDown"] as const; // same for code and key
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const; // codes / key

/**
 * Attach the library's keyboard + mouse fly controls to `camera` on `canvas`:
 * W/A/S/D or arrow keys move, mouse drag looks around, Space rises, PageDown
 * sinks, and holding Shift (left or right) moves three times as fast. Shift
 * never moves the camera vertically on its own.
 *
 * Returns a cleanup function that removes every listener on the canvas and
 * the per-frame hook registered on the scene.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: BOOST_MULTIPLIER,
    });

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detach();
    };
}
