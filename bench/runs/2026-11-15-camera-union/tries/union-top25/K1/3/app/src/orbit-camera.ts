import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls on `canvas` and arrow-key control enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

  // attachControl ignores keyboard: true unless this has run first.
  enableArcRotateKeyboardControls();

  // The scene is passed so that drags and the wheel move the camera through the
  // per-frame hook; without it they only accumulate offsets that nothing applies.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
