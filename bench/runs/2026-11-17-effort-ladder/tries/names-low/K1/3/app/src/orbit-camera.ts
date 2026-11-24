import {
  createArcRotateCamera,
  attachControl,
  enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext, Vec3 } from "@babylonjs/lite";

export function createOrbitCamera(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): ArcRotateCamera {
  const target: Vec3 = { x: 0, y: 0, z: 0 };
  const camera = createArcRotateCamera(0, Math.PI / 2, 10, target);
  attachControl(camera, canvas, scene);
  enableArcRotateKeyboardControls();
  return camera;
}
