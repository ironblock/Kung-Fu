import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly controls for the architecture walkthrough.
// - WASD / arrow keys move, mouse looks around (library defaults).
// - Space rises, PageDown sinks.
// - Either Shift key multiplies speed by 3. Shift is listed only as a fast key,
//   never as an up or down key, so holding it cannot move the camera vertically.
// Both KeyboardEvent.code and KeyboardEvent.key spellings are listed so the
// match works whichever the library compares against.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space", " "],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight", "Shift"],
        fastMultiplier: 3,
    });
}
