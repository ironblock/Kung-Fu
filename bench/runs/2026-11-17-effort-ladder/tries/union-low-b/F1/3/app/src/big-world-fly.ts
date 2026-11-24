import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: [
      "KeyW", "KeyA", "KeyS", "KeyD",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "Space", "PageUp", "PageDown",
      "ShiftLeft", "ShiftRight",
    ],
    fastMultiplier: 20,
  });
}
