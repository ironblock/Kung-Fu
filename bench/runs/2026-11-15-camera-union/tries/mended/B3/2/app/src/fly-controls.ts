import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches the library's keyboard and mouse fly controls to a free camera.
 *
 * - W/A/S/D or arrow keys move, mouse drag looks around.
 * - Space rises, PageDown sinks.
 * - Shift (left or right) is a speed key only (3x). It is not bound to up or down.
 *
 * The default free-camera controls bind ShiftLeft/ShiftRight to "down", so
 * upKeys and downKeys are set explicitly here, which replaces those defaults.
 *
 * Returns the dispose function from the library, which removes the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
