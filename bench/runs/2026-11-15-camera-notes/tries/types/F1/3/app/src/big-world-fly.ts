import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/** How much faster the camera moves while a movement key is held, relative to the library default. */
const MOVE_SPEED_MULTIPLIER = 20;

/** Keys that raise the camera. Same as the library's default up keys. */
const UP_KEYS = ["Space", "PageUp"] as const;

/** Keys that lower the camera. Same as the library's default down keys. */
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

/** Horizontal and forward/back movement keys (WASD and arrows). */
const PLANAR_KEYS = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
] as const;

/**
 * Attach the library's keyboard and mouse fly controls to `camera`, with every
 * movement key (WASD, arrows, and the rise/sink keys) moving the camera
 * `MOVE_SPEED_MULTIPLIER` times as far as the default controls do while held.
 * Mouse look is left to the library.
 *
 * @returns Cleanup function that removes the canvas listeners and the per-frame hook.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        // Every movement key is also a "fast" key, so holding any of them applies the multiplier.
        fastKeys: [...PLANAR_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: MOVE_SPEED_MULTIPLIER,
    });
}
