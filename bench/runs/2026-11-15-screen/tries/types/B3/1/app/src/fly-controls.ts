import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attach fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move; mouse: look around (library defaults).
 * - Space: rise. PageDown: sink.
 * - Left or right Shift: speed boost (3x). Shift is not bound to vertical
 *   movement here; the library's default down keys include Shift, so it is
 *   overridden explicitly.
 *
 * Returns a cleanup function that removes the canvas listeners and any
 * per-frame hook the library registered.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
