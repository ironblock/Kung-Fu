import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const BIG_WORLD_SPEED_MULTIPLIER = 20;

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const originalSpeed = camera.speed;

  // The library's free camera controls use camera.speed for keyboard travel,
  // while mouse look uses angularSensitivity. Scaling speed only changes key
  // movement and leaves mouse look at the default behavior.
  camera.speed = originalSpeed * BIG_WORLD_SPEED_MULTIPLIER;

  const detach = attachFreeControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    try {
      detach();
    } finally {
      camera.speed = originalSpeed;
    }
  };
}
