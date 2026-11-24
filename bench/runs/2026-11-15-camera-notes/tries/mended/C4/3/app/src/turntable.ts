import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

function outside(value: number, lower: number | undefined, upper: number | undefined): boolean {
    return (lower !== undefined && value < lower) || (upper !== undefined && value > upper);
}

/**
 * Glides the orbit camera `turns` full turns in the direction in which alpha grows.
 * Radius, beta and target are kept; the promise resolves once alpha equals
 * its starting value plus 2π · turns.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        return Promise.reject(new RangeError(`turns must be a finite number >= 0, got ${turns}`));
    }

    const goalAlpha = camera.alpha + 2 * Math.PI * turns;

    // interpolateArcRotateCamera clamps its goal to the limit fields, which would
    // end the tour short of the target without any error. Refuse instead.
    if (outside(goalAlpha, camera.lowerAlphaLimit, camera.upperAlphaLimit)) {
        return Promise.reject(new RangeError("spinAround: the target alpha lies outside the camera's alpha limits"));
    }
    if (
        outside(camera.beta, camera.lowerBetaLimit, camera.upperBetaLimit) ||
        outside(camera.radius, camera.lowerRadiusLimit, camera.upperRadiusLimit)
    ) {
        return Promise.reject(new RangeError("spinAround: beta or radius is outside its limits, so it would be clamped"));
    }

    // Beta and radius are passed at their current values so they are not changed.
    // Target is not passed, so it is left as it is.
    return interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
    });
}
