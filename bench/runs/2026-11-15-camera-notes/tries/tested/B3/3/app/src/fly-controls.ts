import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly controls for the free camera, with Shift as a speed key only.
//
// attachFreeControl would also sink the camera on Shift (its default down keys
// are ShiftLeft/ShiftRight/PageDown), so the configurable variant is used with
// explicit key lists: Space rises, PageDown sinks, and Shift multiplies speed.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
