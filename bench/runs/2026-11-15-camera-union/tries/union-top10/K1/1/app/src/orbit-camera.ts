import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls attached to `canvas` and arrow-key
 * control turned on.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // Keyboard control is ignored by attachControl unless this has run first.
  enableArcRotateKeyboardControls();

  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2.5, 10, { x: 0, y: 0, z: 0 });

  // The scene is passed so that drags and wheel input are applied to the camera.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
