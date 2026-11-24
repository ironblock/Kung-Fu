import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/** Movement speed multiplier applied while any movement key is held. */
const FAST_MULTIPLIER = 20;

/** Horizontal/forward/back movement keys (W/A/S/D and arrows). */
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

// ASSUMPTION: these are the rise/sink key codes. They are not confirmed against
// the library's default bindings, so check them before relying on this.
const UP_KEYS = ["KeyE"] as const;
const DOWN_KEYS = ["KeyQ"] as const;

/**
 * Attaches the library's configurable free-camera keyboard/mouse fly controls
 * to `canvas`, with every movement key moving the camera FAST_MULTIPLIER times
 * as far as the default. Mouse look is not scaled.
 *
 * Returns a function that removes all listeners the controls added. This module
 * adds no per-frame work of its own.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
