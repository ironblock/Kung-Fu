import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attach the library's keyboard + mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): speed key only, 3x movement speed
 *
 * Shift is deliberately removed from the down keys. The library's default
 * down keys include Shift, which would make holding Shift sink the camera.
 *
 * The returned function removes the library's canvas listeners and its
 * per-frame hook. It is safe to call more than once.
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
