import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Speed-up applied while any movement key is held (keyboard only; mouse look is untouched).
const FAST_MULTIPLIER = 20;

// Keys that rise and sink, as the library's default fly controls use them.
const RISE_KEYS = ["Space", "PageUp"];
const SINK_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"];

// Every key that moves the camera: WASD, the arrows, and the rise/sink keys.
const MOVE_KEYS = [
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    ...RISE_KEYS,
    ...SINK_KEYS,
];

/**
 * Library fly controls (keyboard + mouse look) with movement keys 20x as fast.
 * Returns a function that removes the controls.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: RISE_KEYS,
        downKeys: SINK_KEYS,
        fastKeys: MOVE_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
}
