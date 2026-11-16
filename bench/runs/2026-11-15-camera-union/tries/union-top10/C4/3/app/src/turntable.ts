import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides the orbit camera `turns` full turns around the model, increasing alpha.
 *
 * Only alpha is given to the library's smooth interpolation, so beta (height
 * angle), radius (distance) and target (look-at point) keep their current values.
 * Nothing else should touch the camera until the returned promise resolves:
 * the library rejects the interpolation if the camera changes mid-flight.
 *
 * Assumption: interpolateArcRotateCamera moves alpha linearly from its start
 * value to the goal, without wrapping to the shortest angular path. The
 * declarations don't say which it does; see the report that accompanies this file.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns <= 0) {
    return Promise.reject(
      new RangeError(`turns must be a positive finite number, got ${turns}`),
    );
  }

  const startAlpha = camera.alpha;
  const goalAlpha = startAlpha + TWO_PI * turns;

  // The interpolation clamps its goal to alpha limits, so the camera would stop
  // short of the required end angle. Refuse rather than end at the wrong angle.
  if (camera.upperAlphaLimit !== undefined && goalAlpha > camera.upperAlphaLimit) {
    return Promise.reject(
      new RangeError(
        `spinAround: goal alpha ${goalAlpha} exceeds upperAlphaLimit ${camera.upperAlphaLimit}`,
      ),
    );
  }

  return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
