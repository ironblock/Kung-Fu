import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const previousAngularSensibility = camera.angularSensibility;
  camera.angularSensibility = previousAngularSensibility / 2;

  let dispose: (() => void) | undefined;
  try {
    dispose = attachControl(camera, canvas, scene);
  } catch (error) {
    camera.angularSensibility = previousAngularSensibility;
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    try {
      dispose?.();
    } finally {
      camera.angularSensibility = previousAngularSensibility;
    }
  };
}
