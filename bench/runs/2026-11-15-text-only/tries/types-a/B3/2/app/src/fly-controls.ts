import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera, with a Shift speed boost.
 *
 * Shift is deliberately NOT in `downKeys`. The library default for descent is
 * ShiftLeft/ShiftRight/PageDown, which would make Shift move the camera down.
 * Overriding `downKeys` removes that default; Shift only appears in `fastKeys`.
 *
 * Returns the library's cleanup, which removes the canvas listeners and any
 * per-frame hook the controls registered.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
