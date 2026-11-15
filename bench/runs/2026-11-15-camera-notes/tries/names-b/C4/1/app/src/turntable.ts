import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, always
 * increasing `alpha`. Distance (radius), height angle (beta) and the look-at
 * point (target) are kept at their current values.
 *
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    const goalAlpha = camera.alpha + TWO_PI * turns;

    return interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
        target: camera.target,
    });
}
