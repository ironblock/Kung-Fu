import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// KeyboardEvent.code values for the library's default movement keys:
// W/A/S/D, arrows, and the keys that rise/sink.
const MOVEMENT_KEYS: readonly string[] = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "PageUp",
  "PageDown",
  "ShiftLeft",
  "ShiftRight",
];

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: MOVEMENT_KEYS,
    fastMultiplier: 20,
  });
}
