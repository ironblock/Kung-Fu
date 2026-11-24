import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

  // Install the library's arrow-key control, then attach it with the default
  // mouse and touch controls plus keyboard input.
  enableArcRotateKeyboardControls();
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
