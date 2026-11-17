import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext
): () => void {
  const originalAngularSensibility = camera.angularSensibility;
  camera.angularSensibility = originalAngularSensibility * 2;

  const detachControl = attachControl(camera, canvas, scene, { keyboard: false });

  return () => {
    try {
      detachControl();
    } finally {
      camera.angularSensibility = originalAngularSensibility;
    }
  };
}
