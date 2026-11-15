import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for the architecture walkthrough.
 *
 * - W/A/S/D or arrow keys: move (library default movement keys).
 * - Mouse: look around.
 * - Space: rise. PageDown: sink.
 * - Left or right Shift: speed boost (3x). Shift is not mapped to vertical
 *   movement, so holding it never moves the camera up or down by itself.
 *
 * The returned function removes the canvas listeners and the per-frame
 * inertia hook registered on the scene. Call it to fully detach the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
