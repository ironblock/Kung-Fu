import {
  createArcRotateCamera,
  attachControl,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
  type Vec3,
} from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const target: Vec3 = { x: 0, y: 0, z: 0 };
  const camera = createArcRotateCamera(0, Math.PI / 4, 10, target);

  enableArcRotateKeyboardControls();
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
