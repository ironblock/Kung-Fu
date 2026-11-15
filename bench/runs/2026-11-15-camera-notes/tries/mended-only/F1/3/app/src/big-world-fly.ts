import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Every key that moves the camera: W/A/S/D, the arrows, Space/PageUp (rise)
// and ShiftLeft/ShiftRight/PageDown (sink), matched by event.code.
const MOVEMENT_KEYS = [
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

// Speeds up keyboard movement only. The camera's speed is left alone on purpose:
// the free camera's turn coasting stops at speed * 0.001, so changing speed
// would change how far a mouse drag turns the camera.
const FAST_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera fly controls to `canvas`, with movement
 * keys moving the camera FAST_MULTIPLIER times as far per held frame. Mouse
 * look is the library's default.
 *
 * Returns the disposer from the library, which removes the canvas listeners
 * and the per-frame hook.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
