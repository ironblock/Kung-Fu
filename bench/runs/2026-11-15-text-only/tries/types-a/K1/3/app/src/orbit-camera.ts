import {
  attachControl,
  createArcRotateCamera,
  enableArcRotateKeyboardControls,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

/** Distance from the camera to the origin, in world units. */
const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from ORBIT_RADIUS units away.
 *
 * Mouse and touch orbit/pan/zoom are attached to `canvas`, and the library's
 * arrow-key controls are enabled as well. The camera is returned but not
 * assigned to the scene; the caller decides how it is used.
 *
 * The detach function returned by `attachControl` is not exposed here, so the
 * canvas listeners stay attached for the lifetime of the page.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
  const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

  // Keyboard control must be installed before `keyboard` is passed to attachControl.
  enableArcRotateKeyboardControls();
  attachControl(camera, canvas, scene, { keyboard: true });

  return camera;
}
