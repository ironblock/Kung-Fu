import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalSpeed = camera.speed;
  camera.speed = originalSpeed * 20;
  const dispose = attachFreeControl(camera, canvas, scene);
  return () => {
    dispose();
    camera.speed = originalSpeed;
  };
}
