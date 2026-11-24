import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/**
 * Glides an ArcRotateCamera around its target using Babylon Lite's built-in
 * smooth camera interpolation.
 *
 * The tour always increases alpha.  A negative `turns` value is treated as its
 * magnitude because the requested behaviour is "always in the direction in which
 * alpha grows".
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    const amount = Number.isFinite(turns) ? Math.abs(turns) : 0;
    if (amount === 0) return;

    const startAlpha = camera.alpha;
    const targetAlpha = startAlpha + TWO_PI * amount;

    // If the target is not finite there is no meaningful interpolation goal.
    if (!Number.isFinite(targetAlpha)) return;

    // Clear leftover inertial movement so interpolateArcRotateCamera does not
    // see an external camera change between its frames.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // Alpha limits would cause interpolateArcRotateCamera to clamp the exact
    // unwrapped goal. Temporarily remove only the bounds that would block the
    // move, then restore them when finished.
    const savedLowerAlpha = camera.lowerAlphaLimit;
    const savedUpperAlpha = camera.upperAlphaLimit;

    const relaxLower = savedLowerAlpha !== undefined && savedLowerAlpha > startAlpha;
    const relaxUpper = savedUpperAlpha !== undefined && savedUpperAlpha < targetAlpha;

    if (relaxLower) camera.lowerAlphaLimit = undefined;
    if (relaxUpper) camera.upperAlphaLimit = undefined;

    try {
        await interpolateArcRotateCamera(camera, scene, { alpha: targetAlpha });
    } finally {
        if (relaxLower) camera.lowerAlphaLimit = savedLowerAlpha;
        if (relaxUpper) camera.upperAlphaLimit = savedUpperAlpha;
    }
}
