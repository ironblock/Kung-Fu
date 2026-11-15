import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach W/A/S/D + arrow-key movement, mouse-look, Space (up), PageDown (down)
 * and a Shift speed boost (3x) to a FreeCamera.
 *
 * Shift is deliberately NOT in `downKeys`: the library's default down keys
 * include ShiftLeft/ShiftRight, which would make Shift sink the camera.
 *
 * Returns the library's cleanup function, which removes the canvas listeners
 * and the per-frame hook. Safe to call more than once.
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
