import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

let keyboardControlsEnabled = false;

export function createOrbitCamera(
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): ArcRotateCamera {
  // The library's keyboard support is installed globally, but attachControl
  // only uses it when keyboard: true is passed and enableArcRotateKeyboardControls()
  // has already run. Keep it enabled once so repeated camera creation does not
  // stack duplicate global keyboard-enable calls.
  if (!keyboardControlsEnabled) {
    enableArcRotateKeyboardControls();
    keyboardControlsEnabled = true;
  }

  // Orbit around the origin from 10 units away. alpha=0 and beta=PI/2 give a
  // horizontal orbit position; the exact starting angle is not important here.
  const camera = createArcRotateCamera(0, Math.PI / 2, 10, {
    x: 0,
    y: 0,
    z: 0,
  });

  // Pass the existing scene so drag/wheel controls update through scene frames.
  // Default pointer mappings give mouse/pen primary-button rotate and
  // secondary-button pan, while touch pointers rotate. keyboard: true turns on
  // the library's arrow-key controls for this camera/canvas.
  attachControl(camera, canvas, scene, {
    keyboard: true,
  });

  return camera;
}
