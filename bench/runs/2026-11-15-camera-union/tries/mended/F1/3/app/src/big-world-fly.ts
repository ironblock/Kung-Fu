import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Every key that moves the camera. Each is listed as a fast key so that holding
// it applies the fast multiplier. Keys are matched by KeyboardEvent.code.
const FORWARD_BACK_LEFT_RIGHT_KEYS = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
] as const;

// upKeys and downKeys replace the library defaults, so they are repeated here.
const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

const FAST_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse controls to the canvas,
 * with every movement key moving the camera FAST_MULTIPLIER times as far as the
 * default controls do.
 *
 * Mouse look is the library's own, unchanged. camera.speed is not modified,
 * because the library's look coasting depends on it.
 *
 * Returns a function that removes all listeners and per-frame work.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: [...FORWARD_BACK_LEFT_RIGHT_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
