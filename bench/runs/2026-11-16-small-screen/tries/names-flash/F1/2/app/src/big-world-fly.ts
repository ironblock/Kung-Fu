import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

const BIG_WORLD_MULTIPLIER = 20;

/*
 * The library's configurable free-camera controls already attach the normal
 * keyboard + mouse fly controls.  We use `fastKeys` so that each movement key
 * itself counts as a "fast" key, and `fastMultiplier` makes keyboard movement
 * 20x the default distance while the key is held.
 *
 * Mouse look / turning is left untouched: we do not modify angularSensitivity,
 * inertia, or any other pointer-look settings.
 */
const MOVEMENT_KEYS: readonly string[] = [
  // WASD + arrows.
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",

  // Common "rise / sink" keys, plus aliases in case the library uses e.key,
  // e.code, or legacy key code strings.
  "KeyQ", "KeyE",
  "PageUp", "PageDown",
  "Space", "ShiftLeft", "ShiftRight",
  "ControlLeft", "ControlRight",
  "AltLeft", "AltRight",

  // Lowercase / uppercase e.key variants.
  "w", "a", "s", "d",
  "q", "e",
  "W", "A", "S", "D",
  "Q", "E",

  // Common arrow-key names.
  "Up", "Down", "Left", "Right",

  // Space key via e.key.
  " ",

  // Legacy numeric key codes as strings, in case the library used older keys.
  "87", "65", "83", "68",
  "38", "40", "37", "39",
  "81", "69",
  "33", "34",
  "32", "16", "17", "18",
];

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: MOVEMENT_KEYS,
    fastMultiplier: BIG_WORLD_MULTIPLIER,
  });
}
