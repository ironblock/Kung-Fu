import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides the orbit camera around its target by `turns` full turns, always in the
 * direction in which alpha grows. Radius, beta and target are left untouched.
 * Resolves once alpha has reached `startAlpha + 2π · turns`.
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    const goalAlpha = camera.alpha + 2 * Math.PI * turns;

    // The interpolation clamps its alpha goal to the alpha limits, which would stop the
    // tour short of a multi-turn goal. Lift them for the duration and restore afterwards.
    const lowerAlphaLimit = camera.lowerAlphaLimit;
    const upperAlphaLimit = camera.upperAlphaLimit;
    camera.lowerAlphaLimit = undefined;
    camera.upperAlphaLimit = undefined;

    try {
        await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
    } finally {
        camera.lowerAlphaLimit = lowerAlphaLimit;
        camera.upperAlphaLimit = upperAlphaLimit;
    }
}
