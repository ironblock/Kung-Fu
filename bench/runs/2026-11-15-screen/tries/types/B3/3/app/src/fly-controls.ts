import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach keyboard and mouse fly controls to a free camera for the architecture walkthrough.
 *
 * - W/A/S/D or arrow keys: move
 * - Mouse: look around
 * - Space: rise, PageDown: sink
 * - Shift (left or right): speed key only, three times as fast. It is not bound to
 *   vertical movement, so holding Shift never moves the camera up or down by itself.
 *
 * The library's default free-camera controls bind Shift to "move down", so the
 * up/down/fast keys are set explicitly here.
 *
 * @returns A cleanup function that detaches the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
