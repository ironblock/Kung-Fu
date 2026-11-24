import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly controls for a FreeCamera, with Shift as a speed-up key only.
//
// attachFreeControl also treats ShiftLeft/ShiftRight as "down", so it is not
// used here. attachConfigurableFreeControl replaces the up/down key lists
// instead of adding to them, so Shift is left out of downKeys and holding it
// never moves the camera vertically.
//
// W/A/S/D and the arrow keys (move), and the mouse drag (look), are the
// library defaults. Space rises, PageDown sinks.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
