import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 *
 * W/A/S/D and the arrow keys move, the mouse looks around, Space rises and
 * PageDown sinks. Shift (left or right) is a speed key only: it multiplies
 * speed by 3 and never moves the camera vertically.
 *
 * The library's default free-camera controls map Shift to "down", so this
 * uses the configurable variant and replaces the vertical key lists.
 *
 * Returns a function that removes the controls (listeners and per-frame work).
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
