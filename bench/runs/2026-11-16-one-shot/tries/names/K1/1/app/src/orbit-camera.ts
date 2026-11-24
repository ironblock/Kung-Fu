import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // Enable the library's arrow-key control, then attach it with the default key mappings.
  enableArcRotateKeyboardControls();

  // Orbit the origin from 10 units away.
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

  // Mouse and touch controls, plus the keyboard control.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
