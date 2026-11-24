import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides the arc-rotate camera around its target by `turns` full turns, in the
 * direction in which alpha grows, using the library's own smooth
 * camera-transition easing. Radius, beta and the look-at target are left
 * untouched, and the promise resolves on arrival with alpha equal to the
 * starting alpha plus 2*PI*turns (left unwrapped).
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  // Stop any residual drag/wheel/pan coasting so the glide starts from exactly
  // the current pose and nothing else moves the camera meanwhile.
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // Only alpha is a goal; beta, radius and target are omitted and stay as they
  // are. The goal is the unwrapped start plus the full turns, so the camera
  // makes the whole trip in the direction of increasing alpha and lands
  // exactly on it.
  const goal = { alpha: camera.alpha + 2 * Math.PI * turns };
  return interpolateArcRotateCamera(camera, scene, goal);
}
