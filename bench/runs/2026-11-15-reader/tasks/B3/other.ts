import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Another right answer: name only the keys the ask names.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const options = { upKeys: ["Space"], downKeys: ["PageDown"], fastKeys: ["ShiftRight", "ShiftLeft"], fastMultiplier: 3 };
    return attachConfigurableFreeControl(camera, canvas, scene, options);
}
