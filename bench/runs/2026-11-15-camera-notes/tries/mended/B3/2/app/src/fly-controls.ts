import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for a FreeCamera.
//
// The plain attachFreeControl maps ShiftLeft/ShiftRight to "move down", so
// holding Shift would sink the camera. attachConfigurableFreeControl lets us
// replace the up/down key lists (see camera-notes.md, note 28), so Shift is
// used only as the speed key here and Space/PageDown move up/down.
//
// Returns a function that removes all listeners and per-frame work.
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
