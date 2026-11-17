import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// The library type declarations only specify `readonly string[]` for the keys,
// not whether those strings are `KeyboardEvent.key`, `KeyboardEvent.code`, or
// normalized names. Include common aliases so left/right Shift still work and
// Space/PageDown are recognized across likely browser key naming conventions.
const upKeys = ["Space", " ", "space", "Spacebar"] as const;
const downKeys = ["PageDown", "pagedown", "page_down", "PAGE_DOWN"] as const;
const fastKeys = [
  "Shift",
  "ShiftLeft",
  "ShiftRight",
  "shift",
  "shiftleft",
  "shiftright",
  "shift_left",
  "shift_right",
  "SHIFT",
  "SHIFT_LEFT",
  "SHIFT_RIGHT",
] as const;

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const dispose = attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys,
    downKeys,
    fastKeys,
    fastMultiplier: 3,
  });

  return () => {
    dispose?.();
  };
}
