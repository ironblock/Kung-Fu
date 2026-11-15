import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is a speed modifier only. It is deliberately absent from upKeys and
// downKeys, so holding it (alone or with other keys) never moves the camera
// vertically.
const FAST_MULTIPLIER = 3;

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
