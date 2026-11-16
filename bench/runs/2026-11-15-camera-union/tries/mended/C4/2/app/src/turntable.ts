import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides an orbit camera `turns` full turns in the direction in which `alpha`
 * grows. Distance, height angle (beta) and target are left unchanged.
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`turns must be a finite number >= 0, got ${turns}`);
    }

    const startAlpha = camera.alpha;
    const goalAlpha = startAlpha + TWO_PI * turns;

    // interpolateArcRotateCamera clamps its alpha goal to the camera's limits,
    // so a goal outside them could never be reached exactly. Refuse up front
    // rather than resolve at a different alpha.
    const lower = camera.lowerAlphaLimit;
    const upper = camera.upperAlphaLimit;
    if (lower !== undefined && goalAlpha < lower) {
        throw new RangeError(`goal alpha ${goalAlpha} is below lowerAlphaLimit ${lower}`);
    }
    if (upper !== undefined && goalAlpha > upper) {
        throw new RangeError(`goal alpha ${goalAlpha} is above upperAlphaLimit ${upper}`);
    }

    // Only alpha is given, so beta, radius and target keep their current values.
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
