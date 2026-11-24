import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
} from "@babylonjs/lite";

export function createOrbitCamera(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): ArcRotateCamera {
  // The library ignores attachControl's keyboard option unless its keyboard
  // controls have been enabled first.
  enableArcRotateKeyboardControls();

  // Orbit at radius 10 around the origin, with the camera placed horizontally
  // around the target.
  const camera = createArcRotateCamera(0, Math.PI / 2, 10, {
    x: 0,
    y: 0,
    z: 0,
  });

  // Hook up the default pointer controls for mouse and touch, plus the library's
  // built-in arrow-key control.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
