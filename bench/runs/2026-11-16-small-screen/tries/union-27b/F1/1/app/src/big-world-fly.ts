import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const BIG_WORLD_MOVEMENT_KEYS = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Space",
  "PageUp",
  "ShiftLeft",
  "ShiftRight",
  "PageDown",
] as const;

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: BIG_WORLD_MOVEMENT_KEYS,
    fastMultiplier: 20,
  });
}
