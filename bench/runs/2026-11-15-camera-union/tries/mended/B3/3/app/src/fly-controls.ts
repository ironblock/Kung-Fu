import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a free camera.
 *
 * W/A/S/D or arrows move, mouse drag looks around, Space rises, PageDown sinks.
 * Holding Shift (left or right) moves three times as fast.
 *
 * Shift is deliberately not listed in downKeys: the library's default down keys
 * include ShiftLeft/ShiftRight, which would make Shift move the camera down.
 *
 * Returns a disposer that removes the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
