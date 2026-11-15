import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an orbit camera around its target by `turns` full turns, in the
 * direction in which alpha grows, using the library's camera-transition
 * interpolation. Radius, beta and target are left as they are.
 *
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        return Promise.reject(new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`));
    }

    const goalAlpha = camera.alpha + 2 * Math.PI * turns;

    // interpolateArcRotateCamera clamps its goal to the alpha limits and then
    // resolves at the clamped value, so a goal outside the limits could never
    // reach the promised alpha. Refuse it up front instead.
    const lower = camera.lowerAlphaLimit;
    const upper = camera.upperAlphaLimit;
    if ((lower !== undefined && goalAlpha < lower) || (upper !== undefined && goalAlpha > upper)) {
        return Promise.reject(
            new RangeError(
                `spinAround: target alpha ${goalAlpha} lies outside the camera's alpha limits [${lower ?? "-∞"}, ${upper ?? "∞"}]`
            )
        );
    }

    return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
