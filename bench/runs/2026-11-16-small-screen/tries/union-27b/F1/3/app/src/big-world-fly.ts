import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Every key the library's default free fly control moves on
// (KeyboardEvent.code values, per the notes on attachFreeControl):
// WASD and the arrows, plus the rise/sink keys.
const BIG_WORLD_MOVEMENT_KEYS = [
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
] as const;

/**
 * Attaches the library's free fly control to `canvas` with one change:
 * every movement key moves the camera 20x as far as the default control
 * would while the key is held. Mouse look is left exactly as the library's
 * default (same drag handling, same angular sensitivity, same inertia and
 * same speed-based stop threshold), because only the key-movement options
 * are touched; `camera.speed` is deliberately left alone, since the look
 * glide threshold is speed-based.
 *
 * The returned function is the library's own detach: it removes the canvas
 * listeners and the per-frame step, leaving nothing of ours running.
 */
export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    // Passing upKeys/downKeys replaces the defaults, so re-state them:
    // Space/PageUp rise, ShiftLeft/ShiftRight/PageDown sink.
    upKeys: ["Space", "PageUp"],
    downKeys: ["ShiftLeft", "ShiftRight", "PageDown"],
    // Mark every movement key as a "fast" key ...
    fastKeys: BIG_WORLD_MOVEMENT_KEYS,
    // ... and make the fast multiplier 20x. The multiplier scales key
    // movement only, so mouse look is unaffected.
    fastMultiplier: 20,
  });
}
