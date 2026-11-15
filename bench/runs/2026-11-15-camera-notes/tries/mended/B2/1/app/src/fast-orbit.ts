import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// How many times farther a drag turns the camera than the library default.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, with drags (including the post-release glide) turning the camera
 * DRAG_SPEED_FACTOR times as far. Wheel zoom is unchanged.
 *
 * The returned function detaches the controls and restores the camera's
 * original angular sensitivity.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  const defaultAngularSensibility = camera.angularSensibility;

  // Drag rotation is pixels / angularSensibility, so halving the value doubles it.
  camera.angularSensibility = defaultAngularSensibility / DRAG_SPEED_FACTOR;

  const detach = attachControl(camera, canvas, scene);

  let attached = true;
  return () => {
    if (!attached) return;
    attached = false;
    detach();
    camera.angularSensibility = defaultAngularSensibility;
  };
}
