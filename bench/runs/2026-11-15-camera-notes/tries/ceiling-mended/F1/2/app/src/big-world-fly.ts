import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How many times farther than the library default each movement key moves the camera. */
const MOVE_MULTIPLIER = 20;

// The library's default fly keys (attachFreeControl): WASD and arrows move,
// Space/PageUp rise, ShiftLeft/ShiftRight/PageDown sink.
const PLANAR_KEYS = [
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
] as const;
const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

/**
 * Gives `camera` the library's keyboard + mouse fly controls on `canvas`, with every
 * movement key moving the camera 20x as far as the default controls do. Mouse look
 * is left exactly as the library default.
 *
 * Why not just raise `camera.speed`? attachFreeControl stops look inertia once the
 * decayed turn drops below `speed * 0.001`, so a higher speed would cut the look
 * glide short and change how far a drag turns the camera. Instead this uses
 * attachConfigurableFreeControl, leaves `speed` alone, and makes every movement key
 * a "fast" key, so the 20x multiplier is in effect exactly while a movement key is held.
 *
 * Returns a function that removes the controls (canvas listeners and per-frame work).
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        // upKeys/downKeys replace the defaults, so spell the defaults out in full.
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        // fastMultiplier only applies while a fast key is held (and defaults to 1),
        // so every movement key is also a fast key.
        fastKeys: [...PLANAR_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: MOVE_MULTIPLIER,
    });

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detach();
    };
}
