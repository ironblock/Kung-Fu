import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Every movement key of the free camera: W/A/S/D, the arrows, and the keys
// that rise (Space, PageUp) and sink (Shift, PageDown). Both the event.code
// and event.key spellings are listed, because the library's matching rule is
// not visible to us; an extra spelling that never occurs is harmless.
const MOVEMENT_KEYS: readonly string[] = [
    "KeyW", "w", "W",
    "KeyA", "a", "A",
    "KeyS", "s", "S",
    "KeyD", "d", "D",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Space", " ",
    "PageUp", "PageDown",
    "ShiftLeft", "ShiftRight", "Shift",
];

// Movement speed multiplier while a movement key is held. camera.speed is
// left alone on purpose: the library also derives its rotation cut-off from
// speed, so changing it would change how far a mouse drag turns the camera.
const FAST_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse controls to `canvas`,
 * with every movement key moving the camera FAST_MULTIPLIER times as far.
 * Mouse look is the library's default. Returns the function that removes the
 * controls.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
