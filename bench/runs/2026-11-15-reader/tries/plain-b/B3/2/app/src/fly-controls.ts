import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse drag: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold for 3x speed. Shift is a speed key only and never moves the camera vertically.
 *
 * Returns a cleanup function that removes the canvas listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // The default free-camera mapping sends Shift to "down", so the key lists are set explicitly here.
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
