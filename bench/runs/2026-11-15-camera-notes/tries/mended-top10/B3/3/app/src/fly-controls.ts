import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift only speeds movement. It is deliberately absent from upKeys and downKeys,
// so holding it (alone or with other keys) never rises or sinks the camera.
// Both the event.key and event.code spellings are listed, since the library's
// key matching is not documented in the declarations.
const FLY_UP_KEYS = [" ", "Space"];
const FLY_DOWN_KEYS = ["PageDown"];
const FLY_FAST_KEYS = ["Shift", "ShiftLeft", "ShiftRight"];
const FLY_FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 * W/A/S/D or arrow keys move, the mouse looks, Space rises, PageDown sinks,
 * and Shift (either side) moves three times as fast.
 *
 * Returns a function that removes the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: FLY_UP_KEYS,
        downKeys: FLY_DOWN_KEYS,
        fastKeys: FLY_FAST_KEYS,
        fastMultiplier: FLY_FAST_MULTIPLIER,
    });
}
