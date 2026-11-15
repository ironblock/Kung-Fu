import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/** Multiplier applied to every movement key relative to the library's default speed. */
const FLY_SPEED_MULTIPLIER = 20;

/** Forward/back/strafe keys: WASD and the arrow keys. */
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

/** Keys that rise. Same as the library's default up keys. */
const UP_KEYS = ["Space", "PageUp"] as const;

/** Keys that sink. Same as the library's default down keys. */
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

/**
 * Attach the library's keyboard and mouse fly controls to a free camera, with
 * every movement key (WASD, arrows, rise/sink keys) moving the camera
 * {@link FLY_SPEED_MULTIPLIER} times as far as the default controls.
 *
 * Mouse look is left untouched: the camera's angular sensitivity and inertia
 * are not modified, and no mouse-related option is changed.
 *
 * @returns A cleanup function that removes the controls' listeners and per-frame hook.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        // Every movement key counts as a "fast" key, so holding any of them
        // applies the multiplier. Rise/sink keys are included so they are
        // scaled too.
        fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: FLY_SPEED_MULTIPLIER,
    });
}
