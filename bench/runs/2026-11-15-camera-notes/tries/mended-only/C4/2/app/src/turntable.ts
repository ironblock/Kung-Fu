import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an orbit camera around its target by `turns` full turns, always in the
 * direction in which alpha grows, using the library's camera-transition easing.
 * Distance, height angle and target are left as they are. Resolves once alpha
 * has reached its starting value plus 2π · turns.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns)) {
    return Promise.reject(new RangeError(`turns must be a finite number, got ${turns}`));
  }

  const start = camera.alpha;
  const goal = start + 2 * Math.PI * turns;

  // The library clamps interpolation goals to the camera's alpha limits, so a
  // goal outside them would resolve at a different alpha than promised. Refuse
  // up front instead of silently finishing short.
  const lo = camera.lowerAlphaLimit;
  const hi = camera.upperAlphaLimit;
  const minAlpha = Math.min(start, goal);
  const maxAlpha = Math.max(start, goal);
  if ((lo != null && minAlpha < lo) || (hi != null && maxAlpha > hi)) {
    return Promise.reject(
      new RangeError(
        `spinAround: a ${turns}-turn spin from alpha ${start} leaves the camera's alpha limits [${lo}, ${hi}]`,
      ),
    );
  }

  // Only alpha moves: beta, radius and target keep their current values.
  return interpolateArcRotateCamera(camera, scene, {
    alpha: goal,
    beta: camera.beta,
    radius: camera.radius,
    target: camera.target,
  });
}
