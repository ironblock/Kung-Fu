import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for the architecture walkthrough.
 *
 * - W/A/S/D or arrow keys: move forward, back, and strafe.
 * - Mouse drag: look around.
 * - Space: rise. PageDown: sink.
 * - Left or right Shift: hold to move three times as fast. Shift is a speed key only.
 *
 * The library's default down-keys include both Shift keys, which would make Shift sink the camera.
 * Overriding `downKeys` to PageDown alone avoids that, and `fastKeys` makes Shift a pure speed key.
 *
 * Returns a cleanup function that removes the canvas listeners and the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
