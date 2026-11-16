import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// attachFreeControl binds ShiftLeft/ShiftRight to "move down" (camera-notes.md, note 55),
// so Shift would sink the camera. attachConfigurableFreeControl lets us replace the
// up/down key lists (note 16) and set a speed multiplier for the fast keys, so Shift
// only changes speed.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
