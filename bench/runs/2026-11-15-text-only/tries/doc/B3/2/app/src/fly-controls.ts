import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Keyboard + mouse fly controls for a FreeCamera, with a Shift speed boost.
 *
 * Uses the configurable free-camera controls rather than attachFreeControl,
 * because the default vertical mapping binds Shift to "move down". Here:
 *  - Space rises, PageDown sinks (Shift is not bound to vertical movement).
 *  - Left or right Shift multiplies movement speed by 3.
 * WASD / arrow keys and mouse look keep the library defaults.
 *
 * Returns the library cleanup, which removes the canvas listeners and the
 * per-frame beforeRender hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
