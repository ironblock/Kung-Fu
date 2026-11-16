import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an orbit camera `turns` full turns around its target, in the direction
 * alpha grows, using the library's own camera-transition easing. Only alpha is
 * part of the goal, so beta, radius and target keep their current values.
 *
 * Resolves once alpha has reached `startAlpha + 2π · turns`. Rejects if another
 * change to the camera interrupts the glide, as the library does.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    return Promise.reject(new RangeError(`turns must be a finite number >= 0, got ${turns}`));
  }

  const goal = camera.alpha + 2 * Math.PI * turns;

  // interpolateArcRotateCamera clamps its goal to the alpha limits, which would
  // stop the camera short of the requested angle, so refuse rather than mislead.
  const { lowerAlphaLimit, upperAlphaLimit } = camera;
  if (
    (lowerAlphaLimit !== undefined && goal < lowerAlphaLimit) ||
    (upperAlphaLimit !== undefined && goal > upperAlphaLimit)
  ) {
    return Promise.reject(
      new RangeError(`a spin to alpha ${goal} is outside the camera's alpha limits`),
    );
  }

  return interpolateArcRotateCamera(camera, scene, { alpha: goal });
}
