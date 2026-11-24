import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
} from "@babylonjs/lite";

let keyboardControlsEnabled = false;

export function createOrbitCamera(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): ArcRotateCamera {
  const camera = createArcRotateCamera(
    Math.PI / 2,
    Math.PI / 2,
    10,
    { x: 0, y: 0, z: 0 },
  );

  if (!keyboardControlsEnabled) {
    enableArcRotateKeyboardControls();
    keyboardControlsEnabled = true;
  }

  // If the keyboard controls listen on the canvas itself, the canvas needs to be focusable.
  if (!canvas.hasAttribute("tabindex")) {
    canvas.tabIndex = 0;
  }

  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
