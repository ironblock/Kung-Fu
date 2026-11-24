import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Keys that move the camera along the horizontal plane. Each one is listed as a
// "fast" key so that holding it applies the fast multiplier.
const MOVEMENT_KEYS: readonly string[] = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
];

const SPEED_MULTIPLIER = 20;

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  // upKeys and downKeys are left unset so the library's own rise/sink keys stay in
  // effect. Their key codes are not in the declarations, so they are not in
  // fastKeys yet. See the note below.
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: MOVEMENT_KEYS,
    fastMultiplier: SPEED_MULTIPLIER,
  });
}
