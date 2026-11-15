import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement keys move the camera this many times as far as the library's default controls.
const FAST_MULTIPLIER = 20;

const FORWARD_BACK_LEFT_RIGHT = [
    "w", "W", "a", "A", "s", "S", "d", "D",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
];

// Keys that rise and sink. These are a guess; adjust to match the library's defaults if needed.
const RISE_KEYS = [" ", "e", "E"];
const SINK_KEYS = ["q", "Q", "c", "C"];

/**
 * Attaches the library's fly controls to the camera, with every movement key
 * (WASD, arrows, rise/sink) moving the camera FAST_MULTIPLIER times as far.
 * Mouse look is left to the library. Returns a function that removes all controls.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: RISE_KEYS,
        downKeys: SINK_KEYS,
        fastKeys: [...FORWARD_BACK_LEFT_RIGHT, ...RISE_KEYS, ...SINK_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
