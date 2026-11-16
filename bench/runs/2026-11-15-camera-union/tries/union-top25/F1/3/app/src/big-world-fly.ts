import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement is multiplied by this factor while a fast key is held.
const BIG_WORLD_SPEED_MULTIPLIER = 20;

// Keys that should give the 20x speed. Every movement key is listed here.
// Rise and sink keys are not known for certain (see the notes below), so the
// list includes the plausible candidates. Listing an unbound key does nothing.
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
    "KeyE",
    "KeyQ",
    "KeyC",
    "ShiftLeft",
    "ShiftRight",
];

/**
 * Attaches the library's fly controls to the camera, with movement keys
 * sped up 20x. Mouse look is the library's default.
 * Returns a function that removes the controls.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // upKeys/downKeys are not passed, so the library's rise/sink defaults stay in effect.
    return attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: BIG_WORLD_SPEED_MULTIPLIER,
    });
}
