import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

let keyboardControlsEnabled = false;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's default mouse/touch controls and its arrow-key control enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // The keyboard option only takes effect once the library's keyboard
  // controls have been enabled, so do that once before attaching.
  if (!keyboardControlsEnabled) {
    enableArcRotateKeyboardControls();
    keyboardControlsEnabled = true;
  }

  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2.5, 10, { x: 0, y: 0, z: 0 });

  // The returned detach function is not kept; the camera stays attached to the canvas.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
