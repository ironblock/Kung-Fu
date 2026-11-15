import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Keyboard and mouse fly controls for a FreeCamera.
// W/A/S/D and the arrow keys move, the mouse looks around, Space rises, PageDown sinks.
// Either Shift key multiplies the speed by 3. Shift is not in upKeys or downKeys,
// so holding it never moves the camera vertically on its own.
// The returned function is the library's detach, which removes the canvas listeners
// and the per-frame hook.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
    upKeys: ["Space"],
    downKeys: ["PageDown"],
  });
}
