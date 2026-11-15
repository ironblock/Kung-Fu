import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly controls for the free camera.
// Built on attachConfigurableFreeControl rather than attachFreeControl because the
// stock attachFreeControl treats ShiftLeft/ShiftRight as "down" keys, which would
// make holding Shift sink the camera. Here the key lists are set explicitly:
//   - Space rises, PageDown sinks (upKeys/downKeys replace the defaults).
//   - Shift is only in fastKeys, so it changes speed and never moves vertically.
// W/A/S/D and the arrow keys for movement and mouse drag for looking come from the
// library's defaults.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
