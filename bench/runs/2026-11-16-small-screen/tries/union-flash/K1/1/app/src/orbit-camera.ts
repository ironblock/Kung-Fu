import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

let keyboardControlsEnabled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const target = { x: 0, y: 0, z: 0 } as ArcRotateCamera["target"];
  const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 2, 10, target);

  // Babylon Lite ignores keyboard: true unless keyboard controls were enabled first.
  if (!keyboardControlsEnabled) {
    enableArcRotateKeyboardControls();
    keyboardControlsEnabled = true;
  }

  attachControl(camera, canvas, scene, {
    pointerMappings: {
      primaryButton: "rotate",
      secondaryButton: "pan",
    },
    keyboard: true,
  });

  return camera;
}
