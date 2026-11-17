import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const previousAngularSensibility = camera.angularSensibility;
  camera.angularSensibility = previousAngularSensibility * 2;

  let detach: () => void;
  try {
    detach = attachControl(camera, canvas, scene);
  } catch (error) {
    camera.angularSensibility = previousAngularSensibility;
    throw error;
  }

  return () => {
    detach();
    camera.angularSensibility = previousAngularSensibility;
  };
}
