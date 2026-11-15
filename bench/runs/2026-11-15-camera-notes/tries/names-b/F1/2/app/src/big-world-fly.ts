import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement keys (W/A/S/D, arrows, rise/sink). Every one of them is also listed
// as a "fast" key so that holding it moves the camera FAST_MULTIPLIER times as far
// as the library's default fly controls do.
const FORWARD_BACK_LEFT_RIGHT_KEYS = [
    "w", "W", "a", "A", "s", "S", "d", "D",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
] as const;

// NOTE: these rise/sink keys are guesses. The declarations do not state the
// library's default rise/sink bindings, so adjust them to match the library.
const UP_KEYS = ["e", "E", " ", "PageUp"] as const;
const DOWN_KEYS = ["q", "Q", "Shift", "PageDown"] as const;

const FAST_MULTIPLIER = 20;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: [...FORWARD_BACK_LEFT_RIGHT_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
