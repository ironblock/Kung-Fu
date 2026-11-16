import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    // Space and PageDown are the only vertical keys. Shift is not listed here,
    // so holding it does not move the camera vertically.
    upKeys: ["Space", " "],
    downKeys: ["PageDown"],
    // Shift (either side) is a speed key only.
    fastKeys: ["Shift", "ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });
}
