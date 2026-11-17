import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit (arc-rotate) camera that looks at the origin from 10 units
 * away, and attaches the library's usual pointer/touch controls plus its
 * arrow-key controls to the given canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // alpha 0 / beta PI/2 puts the camera on the horizon, looking at the origin.
  const camera = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

  // Per the notes, keyboard: true is ignored unless this factory has been installed first.
  enableArcRotateKeyboardControls();

  // The scene is passed so drag/wheel/key motion is applied on scene frames.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
