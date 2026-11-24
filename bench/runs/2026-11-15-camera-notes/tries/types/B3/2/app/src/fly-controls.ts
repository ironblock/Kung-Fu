import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attach fly-through keyboard and mouse controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move (handled by the library's free-camera movement).
 * - Mouse: look around.
 * - Space: rise. PageDown: sink.
 * - Left or right Shift: hold to move three times as fast. Shift is speed-only.
 *
 * Shift is deliberately NOT in `downKeys`. The library's default down keys
 * include ShiftLeft and ShiftRight, which would make Shift sink the camera.
 *
 * Returns a cleanup function that removes the canvas listeners and the
 * per-frame inertia hook registered on `scene`.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
