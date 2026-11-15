import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold for 3x speed. Shift is only a speed key and
 *   is never bound to up or down.
 *
 * Returns a function that removes the controls (listeners and per-frame work).
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        // Both KeyboardEvent.code ("Space") and KeyboardEvent.key (" ") spellings are
        // listed, since the docs for the library's key matching were not available.
        upKeys: ["Space", " "],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight", "Shift"],
        fastMultiplier: 3,
    });
}
