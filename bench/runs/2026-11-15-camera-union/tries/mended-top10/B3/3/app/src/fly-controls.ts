import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
//
// W/A/S/D and the arrow keys move, the mouse looks around (provided by the
// library's free camera controls). Space rises and PageDown sinks. Holding
// either Shift key multiplies speed by three.
//
// Shift is listed only in fastKeys. It is not in upKeys or downKeys, so it
// never moves the camera vertically by itself.
//
// Key names are given both as KeyboardEvent.key and KeyboardEvent.code forms
// so that either matching style the library uses will work.
//
// The returned function is the library's own dispose. It removes the canvas
// listeners and stops the per-frame work.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: [" ", "Space"],
        downKeys: ["PageDown"],
        fastKeys: ["Shift", "ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
