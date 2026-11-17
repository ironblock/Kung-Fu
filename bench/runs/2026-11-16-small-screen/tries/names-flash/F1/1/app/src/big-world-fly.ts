import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const MOVEMENT_MULTIPLIER = 20;

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalSpeed = camera.speed;
  const fastSpeed = originalSpeed * MOVEMENT_MULTIPLIER;

  // Make keyboard translation faster before attaching, in case the controls
  // snapshot camera.speed during attachment.
  camera.speed = fastSpeed;

  let disposeControls: () => void;
  try {
    disposeControls = attachFreeControl(camera, canvas, scene);
  } catch (error) {
    camera.speed = originalSpeed;
    throw error;
  }

  // Reapply after attachment in case the controls reset or modified speed
  // while attaching. Mouse look uses angularSensitivity, which we leave alone.
  camera.speed = fastSpeed;

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    disposeControls();
    camera.speed = originalSpeed;
  };
}
