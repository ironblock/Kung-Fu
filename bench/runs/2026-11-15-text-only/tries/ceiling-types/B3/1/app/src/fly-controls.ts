import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Key codes (KeyboardEvent.code) that make the camera move faster while held. */
const BOOST_KEYS: readonly string[] = ["ShiftLeft", "ShiftRight"];

/** Movement-speed multiplier while a boost key is held. */
const BOOST_MULTIPLIER = 3;

/**
 * Attach fly-through controls to a free camera:
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): move three times as fast
 *
 * The library's default free-camera controls also use Shift to sink, so the
 * vertical key lists are given explicitly here. That way Shift only boosts
 * speed and never moves the camera up or down by itself.
 *
 * Returns a function that removes the canvas listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: BOOST_KEYS,
        fastMultiplier: BOOST_MULTIPLIER,
    });
}
