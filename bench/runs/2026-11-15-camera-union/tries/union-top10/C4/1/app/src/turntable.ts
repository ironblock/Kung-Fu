import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an orbit camera around its target by `turns` full turns, in the
 * direction in which `alpha` grows. Distance (radius), height angle (beta) and
 * the look-at point (target) are left as they are. Resolves when the camera
 * has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    return Promise.reject(
      new RangeError(`turns must be a finite, non-negative number, got ${turns}`),
    );
  }

  const goalAlpha = camera.alpha + 2 * Math.PI * turns;

  // interpolateArcRotateCamera clamps its goals to the alpha limits, so a goal
  // outside them would end short of the requested angle. Refuse it up front.
  const lower = camera.lowerAlphaLimit;
  const upper = camera.upperAlphaLimit;
  if ((lower !== undefined && goalAlpha < lower) || (upper !== undefined && goalAlpha > upper)) {
    return Promise.reject(
      new RangeError(
        `spin goal alpha ${goalAlpha} lies outside the camera's alpha limits [${lower ?? "-∞"}, ${upper ?? "∞"}]`,
      ),
    );
  }

  // Only alpha is in the goal, so radius, beta and target keep their values.
  return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
