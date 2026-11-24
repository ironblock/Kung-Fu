import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
// - W/A/S/D and the arrow keys move, the mouse looks around (library defaults).
// - Space rises and PageDown sinks. upKeys/downKeys replace the library
//   defaults, so only these keys change height.
// - Either Shift key triples the speed. Shift is only in fastKeys, never in
//   upKeys or downKeys, so it cannot move the camera up or down by itself.
// Returns the library's disposer, which removes the canvas listeners and the
// per-frame hook.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: ["Space"],
    downKeys: ["PageDown"],
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });
}
