import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Every key that moves the camera by default: forward/back/left/right,
// up (Space, PageUp) and down (ShiftLeft, ShiftRight, PageDown).
// Listing all of them as fast keys makes each one move 20x as far.
const MOVEMENT_KEYS: readonly string[] = [
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Space", "PageUp",
    "ShiftLeft", "ShiftRight", "PageDown",
];

const MOVE_MULTIPLIER = 20;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        fastKeys: MOVEMENT_KEYS,
        fastMultiplier: MOVE_MULTIPLIER,
    });
}
