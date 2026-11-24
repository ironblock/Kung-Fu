import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach keyboard + mouse fly controls to a FreeCamera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): hold to move 3x as fast
 *
 * Shift is deliberately not a vertical key. The library's default free-camera
 * controls bind Shift to "down", so the vertical key lists are overridden here.
 *
 * Returns a cleanup function that removes the canvas listeners and the
 * per-frame hook installed by the library.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
