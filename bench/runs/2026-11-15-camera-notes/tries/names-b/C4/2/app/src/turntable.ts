import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides the orbit camera around the model by `turns` full turns, in the
 * direction in which `alpha` grows. Distance (radius), height angle (beta)
 * and the look-at point (target) are held at their current values.
 *
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    const startAlpha = camera.alpha;
    const goalAlpha = startAlpha + 2 * Math.PI * turns;

    return interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
        target: camera.target,
    });
}
