import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

// enableArcRotateKeyboardControls() must run before attachControl({ keyboard: true })
// takes effect (camera-notes.md, note 9). It is only called once per module load.
let keyboardControlsEnabled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const camera = createArcRotateCamera(
    -Math.PI / 2,
    Math.PI / 2,
    ORBIT_RADIUS,
    { x: 0, y: 0, z: 0 },
  );

  if (!keyboardControlsEnabled) {
    enableArcRotateKeyboardControls();
    keyboardControlsEnabled = true;
  }

  // Passing the scene lets drags, wheel and pinch move the camera each frame (notes 1 and 30).
  // Mouse and touch use the library defaults; the keyboard is turned on here.
  // The returned detach function is not kept, because createOrbitCamera returns only the camera.
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
