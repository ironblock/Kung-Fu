import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Space rises. PageDown sinks. Shift is deliberately NOT a down key. */
const UP_KEYS = ["Space"] as const;
const DOWN_KEYS = ["PageDown"] as const;

/** Holding either Shift only multiplies speed; it never moves the camera. */
const FAST_KEYS = ["ShiftLeft", "ShiftRight"] as const;
const FAST_MULTIPLIER = 3;

/**
 * Attach WASD/arrow movement, mouse look, Space/PageDown vertical movement and
 * a Shift speed boost to a free camera.
 *
 * Uses the configurable free-camera controls rather than the default ones,
 * because the default down-keys include ShiftLeft/ShiftRight, which would make
 * Shift move the camera down.
 *
 * @returns A cleanup function that removes the canvas listeners and the
 * per-frame hook. Safe to call more than once.
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

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detach();
    };
}
