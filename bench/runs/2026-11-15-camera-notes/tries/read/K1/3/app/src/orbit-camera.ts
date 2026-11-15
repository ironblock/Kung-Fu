import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// enableArcRotateKeyboardControls() installs the keyboard handling globally.
// It must run before attachControl, and only needs to run once.
let arcRotateKeyboardEnabled = false;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key rotation on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // alpha = -PI/2, beta = PI/2 places the camera on the horizon, 10 units out.
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

  if (!arcRotateKeyboardEnabled) {
    enableArcRotateKeyboardControls();
    arcRotateKeyboardEnabled = true;
  }

  // The scene is required, otherwise the input never moves the camera.
  // The returned disposer is not kept, because the signature has no place for it.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
