import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCameraControlOptions } from "@babylonjs/lite";

/** Movement is multiplied by this while any key in FAST_KEYS is held. */
const FAST_MULTIPLIER = 20;

/**
 * Keys that move the camera. Holding any of them gets the multiplier.
 * The keys that rise and sink are not all named here: upKeys and downKeys
 * keep the library defaults, and the default sink key is not known to this
 * file (see the note on the sink key below).
 */
const FAST_KEYS: readonly string[] = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
];

/**
 * Attaches the library's keyboard and mouse fly controls to the canvas, with
 * movement keys 20 times as fast. Mouse look is not changed.
 * Returns a function that removes every listener the controls added.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const options: FreeCameraControlOptions = {
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    };
    return attachConfigurableFreeControl(camera, canvas, scene, options);
}
