import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const BIG_WORLD_MOVEMENT_MULTIPLIER = 20;

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const previousSpeed = camera.speed;
  camera.speed = previousSpeed * BIG_WORLD_MOVEMENT_MULTIPLIER;

  let detachControl: (() => void) | undefined;
  try {
    detachControl = attachFreeControl(camera, canvas, scene);
  } catch (error) {
    camera.speed = previousSpeed;
    throw error;
  }

  if (detachControl === undefined) {
    camera.speed = previousSpeed;
    throw new Error("attachFreeControl did not return a disposer.");
  }

  const dispose = detachControl;
  let disposed = false;

  return () => {
    if (disposed) {
      return;
    }
    disposed = true;

    try {
      dispose();
    } finally {
      camera.speed = previousSpeed;
    }
  };
}
