import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
//
// Built on the library's configurable free-camera controls so that the
// vertical keys and the speed key can be set explicitly. Shift is only a
// speed modifier here: it is listed as a fast key and is not listed as an
// up or down key, so holding it never moves the camera vertically.
//
// Key names are given both as KeyboardEvent.code and KeyboardEvent.key forms
// so that either convention the library matches on works.
const UP_KEYS = ["Space", " "];
const DOWN_KEYS = ["PageDown"];
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"];
const FAST_MULTIPLIER = 3;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D and arrow keys move, mouse look turns the view (library defaults).
 * - Space rises, PageDown sinks.
 * - Holding Shift (either side) moves three times as fast.
 *
 * Returns a function that removes all listeners and per-frame work.
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
