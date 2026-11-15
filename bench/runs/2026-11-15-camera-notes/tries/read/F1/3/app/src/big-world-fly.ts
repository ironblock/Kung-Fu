import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// KeyboardEvent.code values for every key that moves the camera:
// W/A/S/D, the arrows, Space/PageUp (rise) and Shift/PageDown (sink).
// Listing them as fast keys makes each of them move the camera fastMultiplier
// times as far while held. Up/down keys are left at the library defaults.
const MOVEMENT_KEYS: readonly string[] = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "PageUp",
    "ShiftLeft",
    "ShiftRight",
    "PageDown",
];

const FAST_MULTIPLIER = 20;

/**
 * Attaches fly controls to the camera with movement keys 20x as fast as the
 * library default. Mouse look is not scaled.
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
