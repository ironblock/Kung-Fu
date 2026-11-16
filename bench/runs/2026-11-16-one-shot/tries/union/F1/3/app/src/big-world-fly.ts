import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement keys that the library's free-camera controls listen for.
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

// Rise and sink keys, matching the library's default free-camera bindings.
const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

const FAST_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to the
 * canvas, with every movement key moving the camera FAST_MULTIPLIER times as
 * far as the default controls. Mouse look is left to the library.
 *
 * Returns a function that removes the controls. This wrapper adds no listeners
 * and no per-frame work of its own.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        // Marking every movement key as "fast" makes each one use the
        // multiplier. fastMultiplier defaults to 1, so it must be set.
        fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
