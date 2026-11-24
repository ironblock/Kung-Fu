import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const savedSensibility = camera.angularSensibility;
  camera.angularSensibility = savedSensibility / 2;
  const disposeControl = attachControl(camera, canvas, scene);
  return () => {
    disposeControl();
    camera.angularSensibility = savedSensibility;
  };
}
