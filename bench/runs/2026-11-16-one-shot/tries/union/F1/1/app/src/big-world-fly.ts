import {
  attachConfigurableFreeControl,
  type FreeCamera,
  type SceneContext,
} from "@babylonjs/lite";

// Default library key sets for fly movement.
const MOVE_KEYS = [
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
] as const;
const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

const BIG_WORLD_MULTIPLIER = 20;

/**
 * Attaches fly controls to a free camera with every movement key 20x as fast.
 * Each movement key is also listed as a "fast" key, so holding it applies
 * fastMultiplier. Mouse look is handled by the same control, with no
 * change to the camera's speed or sensitivity.
 *
 * Returns the disposer from the library, which removes the canvas listeners
 * and the per-frame hook.
 */
export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: UP_KEYS,
    downKeys: DOWN_KEYS,
    fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
    fastMultiplier: BIG_WORLD_MULTIPLIER,
  });
}
