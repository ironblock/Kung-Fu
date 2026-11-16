import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag (any button): look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold to move 3x as fast; Shift is not bound to
 *   vertical movement. The library's default attachFreeControl maps Shift to
 *   "down", so it is not used here.
 *
 * The returned function removes the controls (canvas listeners and the
 * per-frame update).
 */
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
