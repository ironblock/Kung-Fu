import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Movement is this many times as fast as the library default while a movement key is held. */
const BIG_WORLD_SPEED_MULTIPLIER = 20;

const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;
const MOVE_KEYS = [
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
 * Attach the library's keyboard + mouse fly controls to a free camera, with
 * every movement key (WASD, arrows, rise and sink keys) moving the camera
 * {@link BIG_WORLD_SPEED_MULTIPLIER} times as far while held. Mouse look is
 * left to the library.
 *
 * Returns the library's cleanup, which removes the canvas listeners and the
 * per-frame hook. This module adds no listeners or per-frame work of its own.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        // Holding any movement or rise/sink key activates the multiplier.
        fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: BIG_WORLD_SPEED_MULTIPLIER,
    });
}
