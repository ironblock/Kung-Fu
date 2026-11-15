import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
//
// Built on the configurable free-camera controls rather than attachFreeControl,
// because the default preset binds Shift and PageDown to "descend" and
// PageUp/Space to "ascend". Here upKeys and downKeys replace those defaults,
// so Shift is only a speed key.
//
// Keys: W/A/S/D and arrow keys move (handled by the library); mouse drag looks;
// Space rises; PageDown sinks; Shift (left or right) moves 3x as fast.
// The library's keys only respond while the canvas has focus.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
