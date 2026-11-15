import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Rise while held. */
const UP_KEYS = ["Space"] as const;

/**
 * Sink while held. Only PageDown is listed on purpose: the library's default
 * down keys are ShiftLeft, ShiftRight and PageDown. We want Shift to change
 * speed only, so we replace that default list.
 */
const DOWN_KEYS = ["PageDown"] as const;

/** Move faster while held (either Shift key). */
const FAST_KEYS = ["ShiftLeft", "ShiftRight"] as const;

/** How much faster the camera moves while a fast key is held. */
const FAST_MULTIPLIER = 3;

/**
 * Attach keyboard and mouse fly controls to a free camera:
 * - W/A/S/D or the arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right), held: move three times as fast. It never moves the
 *   camera up or down by itself.
 *
 * Passing `scene` lets the library run its per-frame movement and inertia hook.
 *
 * @returns A function that removes the canvas listeners and the per-frame hook.
 *   You can call it more than once.
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detach();
    };
}
