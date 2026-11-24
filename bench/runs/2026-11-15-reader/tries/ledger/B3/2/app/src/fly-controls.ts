import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard and mouse fly controls for a FreeCamera, built on the library's
 * configurable free-camera controls.
 *
 * - W/A/S/D or arrow keys: move; mouse drag: look around
 * - Space (and PageUp, the library default): rise; PageDown: sink
 * - Shift (left or right): speed only, three times as fast. Shift does not
 *   move the camera down. The library's default controls bind Shift to "down",
 *   so the down binding is replaced with PageDown alone.
 *
 * Returns a function that removes every listener on the canvas and the
 * per-frame update from the scene.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space", "PageUp"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
