import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const originalAngularSensibility = camera.angularSensibility;
  camera.angularSensibility = originalAngularSensibility * 2;

  let dispose: (() => void) | undefined;
  try {
    dispose = attachControl(camera, canvas, scene);
  } catch (error) {
    camera.angularSensibility = originalAngularSensibility;
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    dispose?.();
    camera.angularSensibility = originalAngularSensibility;
  };
}
