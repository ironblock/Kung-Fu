import {
  createArcRotateCamera,
  attachControl,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(
  canvas: HTMLCanvasElement,
  scene: SceneContext
): ArcRotateCamera {
  const camera = createArcRotateCamera(
    0,
    Math.PI / 2.5,
    ORBIT_RADIUS,
    { x: 0, y: 0, z: 0 }
  );

  // Register the library's arrow-key handler before asking attachControl to use it.
  enableArcRotateKeyboardControls();

  // Mouse and touch controls, plus arrow-key control.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
