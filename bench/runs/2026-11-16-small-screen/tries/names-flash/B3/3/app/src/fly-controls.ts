import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// The library’s default free controls keep WASD/arrow movement and mouse look.
// These options only customize the vertical keys and the Shift boost multiplier.
// Include both event.key and event.code-style spellings because different
// keyboard-control implementations normalize keys differently.
const upKeys: readonly string[] = ["Space", " ", "space", "Spacebar"];
const downKeys: readonly string[] = ["PageDown", "pagedown"];
const fastKeys: readonly string[] = [
  "Shift",
  "shift",
  "ShiftLeft",
  "ShiftRight",
  "shiftleft",
  "shiftright",
];

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys,
    downKeys,
    fastKeys,
    fastMultiplier: 3,
  });
}
