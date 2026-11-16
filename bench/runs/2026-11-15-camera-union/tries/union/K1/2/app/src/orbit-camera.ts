import {
  createArcRotateCamera,
  attachControl,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key rotation on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

  // Keyboard input is ignored by attachControl unless this has run first.
  enableArcRotateKeyboardControls();

  // The scene must be passed, otherwise drags and wheel do not move the camera.
  // The returned detach function is not kept, so the listeners stay attached.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
