import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns,
 * in the direction in which `alpha` grows. Distance (radius), height
 * angle (beta) and the look-at point (target) are left unchanged.
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

    // Only alpha is in the goal, so beta, radius and target are not touched.
    // The goal is an unwrapped number, so the glide runs in the direction of
    // growing alpha rather than along the shortest angular path.
    return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
