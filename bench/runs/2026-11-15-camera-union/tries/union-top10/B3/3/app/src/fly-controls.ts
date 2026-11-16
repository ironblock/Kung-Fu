import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
// W/A/S/D and the arrow keys move, the mouse looks around (handled by the library).
// Space rises, PageDown sinks. Either Shift key multiplies speed by 3.
// Shift is listed only in fastKeys, never in upKeys or downKeys, so holding it
// cannot change the camera's height on its own.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
