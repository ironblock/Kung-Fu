import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Movement keys (both cases, plus arrows).
const MOVE_KEYS: readonly string[] = [
  "w", "W", "a", "A", "s", "S", "d", "D",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
];

// Rise and sink keys. These are assumed values, not the library's defaults.
// Replace them with the keys the library actually uses for rise and sink.
const UP_KEYS: readonly string[] = [" ", "e", "E"];
const DOWN_KEYS: readonly string[] = ["q", "Q", "c", "C"];

const FAST_MULTIPLIER = 20;

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  // Every movement key is also a "fast" key, so holding it applies the
  // multiplier to that movement. Mouse look is not configured here, so it
  // keeps the library's default behavior.
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: UP_KEYS,
    downKeys: DOWN_KEYS,
    fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
    fastMultiplier: FAST_MULTIPLIER,
  });
}
