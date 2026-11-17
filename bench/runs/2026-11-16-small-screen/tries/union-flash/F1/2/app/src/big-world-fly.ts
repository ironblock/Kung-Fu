import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Default movement keys used by Babylon Lite's free-camera controls, per the notes:
// WASD/arrows for ground-style movement, Space/PageUp to rise, and
// ShiftLeft/ShiftRight/PageDown to sink.
const BIG_WORLD_MOVEMENT_KEYS: readonly string[] = [
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
  "ShiftLeft",
  "ShiftRight",
  "PageDown",
];

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: BIG_WORLD_MOVEMENT_KEYS,
    fastMultiplier: 20,
  });
}
