import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

const FAST_MULTIPLIER = 3;

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // attachFreeControl maps ShiftLeft/ShiftRight to "down", so it can't be used here.
    // upKeys and downKeys replace the library defaults, so Shift is not bound to vertical motion.
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
