import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const camera = createArcRotateCamera(0, Math.PI / 2, 10, [0, 0, 0]);
  attachControl(camera, canvas, scene, { keyboard: true });
  return camera;
}
