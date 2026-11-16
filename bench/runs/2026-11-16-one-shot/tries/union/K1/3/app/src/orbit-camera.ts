import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // Looks at the origin from 10 units away.
  const camera = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

  // attachControl ignores keyboard: true until this has run, so it must come first.
  enableArcRotateKeyboardControls();

  // Passing the scene lets drags and the wheel move the camera through the per-frame hook.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
