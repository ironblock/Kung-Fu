import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches the library's keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move (library defaults)
 * - Mouse: look around (library defaults)
 * - Space: rise
 * - PageDown: sink
 * - Shift (left or right): hold for 3x speed. Shift is only a speed key and
 *   is not mapped to up or down.
 *
 * Returns a function that removes the controls. Calling it removes the
 * library's listeners from the canvas and stops its per-frame work.
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
