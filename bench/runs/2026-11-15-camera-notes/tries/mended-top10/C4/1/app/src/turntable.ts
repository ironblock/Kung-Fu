import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/**
 * Glides an orbit camera around its target by `turns` full turns, in the
 * direction in which `alpha` grows. Distance (radius), height angle (beta)
 * and the look-at point are left untouched. Resolves once the camera has
 * arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number,
): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        return Promise.reject(new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`));
    }

    const startAlpha = camera.alpha;
    const goalAlpha = startAlpha + TWO_PI * turns;

    // The library clamps alpha to the camera's limit fields, so a goal past
    // the upper limit could never be reached and the promise would hang.
    if (camera.upperAlphaLimit !== undefined && goalAlpha > camera.upperAlphaLimit) {
        return Promise.reject(
            new RangeError(
                `spinAround: target alpha ${goalAlpha} is beyond upperAlphaLimit ${camera.upperAlphaLimit}`,
            ),
        );
    }

    // Only alpha is in the goal, so beta, radius and target keep their values.
    return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
