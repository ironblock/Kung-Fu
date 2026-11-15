import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard + mouse fly controls for a free camera.
 * W/A/S/D or arrows move, mouse drag looks, Space (or PageUp) rises, PageDown sinks.
 * Holding either Shift key triples movement speed; Shift never moves the camera vertically.
 * Returns a function that removes all listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space", "PageUp"],
        // The library's default down keys include Shift; override so Shift is only a speed key.
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
