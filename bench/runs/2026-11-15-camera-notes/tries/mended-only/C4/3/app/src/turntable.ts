import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns
 * (alpha grows by 2π · turns), using the library's interpolation easing.
 * Distance, height angle (beta) and target are kept as they are.
 * Resolves once the camera has arrived.
 *
 * Note: the goal is the unwrapped alpha (start + 2π · turns), so the
 * camera turns the way alpha grows for positive `turns`.
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number,
): Promise<void> {
    const goalAlpha = camera.alpha + TWO_PI * turns;

    await interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
        target: camera.target,
    });
}
