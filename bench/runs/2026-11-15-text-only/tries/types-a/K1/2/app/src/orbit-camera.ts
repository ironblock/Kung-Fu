import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

/** Orbit radius, in world units, from the origin. */
const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls and arrow-key controls attached to `canvas`.
 *
 * The control attachment's cleanup function is not returned (the signature only
 * returns the camera). The listeners live on `canvas`, so they are not removed
 * by scene disposal.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  // alpha = -PI/2 and beta = PI/2 place the camera on the -Z axis at the horizon
  // (the usual Babylon.js arc-rotate starting pose).
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

  // Keyboard support is an opt-in module; it must be installed before
  // attachControl is given `keyboard`. The call is idempotent.
  enableArcRotateKeyboardControls();

  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
