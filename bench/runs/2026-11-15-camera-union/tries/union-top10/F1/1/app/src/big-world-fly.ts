import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement keys that get the speed-up. Both KeyboardEvent.key values and
// KeyboardEvent.code values are listed, in case the library matches either.
const MOVEMENT_KEYS: readonly string[] = [
    "w", "W", "KeyW",
    "a", "A", "KeyA",
    "s", "S", "KeyS",
    "d", "D", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
];

const SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to the
 * canvas, with every movement key moving the camera 20x as far as the default.
 * Mouse look is left to the library's own handling.
 *
 * Returns a function that removes the controls.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // NOTE: upKeys / downKeys (the rise and sink keys) are not listed here.
    // Their default key names are not in the declarations I was given, and
    // passing options may replace the library defaults rather than merge them.
    // Those keys therefore do NOT get the 20x boost yet. Fill in upKeys/downKeys
    // with the library's rise/sink keys, and add them to fastKeys too.
    return attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: SPEED_MULTIPLIER,
    });
}
