import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement keys: W/A/S/D, the arrows, the keys that rise and the keys that sink.
const FORWARD_BACK_STRAFE_KEYS = [
    "KeyW", "KeyS", "KeyA", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
] as const;
const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

/** How much faster every movement key moves the camera than the library default. */
const MOVE_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to the canvas,
 * with every movement key moving the camera MOVE_MULTIPLIER times as far.
 *
 * Mouse look is left to the library's own control and is not scaled.
 * Returns a function that removes all listeners the library added.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const movementKeys = [...FORWARD_BACK_STRAFE_KEYS, ...UP_KEYS, ...DOWN_KEYS];
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: movementKeys,
        fastMultiplier: MOVE_MULTIPLIER,
    });
}
