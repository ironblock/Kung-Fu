import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // Looks at the origin from ORBIT_RADIUS units away.
  const camera = createArcRotateCamera(0, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

  // The arrow-key control must be enabled before attachControl runs.
  enableArcRotateKeyboardControls();

  // Mouse and touch use the library's default pointer mappings.
  // The returned detach function is not kept, so the controls stay attached.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
