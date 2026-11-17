import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const previousSpeed = camera.speed;
  camera.speed = previousSpeed * 20;

  const detach = attachFreeControl(camera, canvas, scene);
  let disposed = false;

  return () => {
    if (disposed) return;
    disposed = true;
    detach();
    camera.speed = previousSpeed;
  };
}
