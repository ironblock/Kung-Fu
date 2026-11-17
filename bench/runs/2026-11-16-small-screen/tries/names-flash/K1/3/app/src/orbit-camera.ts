import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const origin = { x: 0, y: 0, z: 0 } as unknown as Parameters<typeof createArcRotateCamera>[3];

  const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 2, 10, origin);

  enableArcRotateKeyboardControls();
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
