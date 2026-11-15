import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
//
// attachFreeControl (the library's default) treats ShiftLeft/ShiftRight as
// "move down", so holding Shift alone would sink the camera. The configurable
// variant replaces the up/down key lists, so Shift is kept out of them and is
// used only as a speed key via fastKeys/fastMultiplier.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space", "PageUp"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
