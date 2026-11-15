import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Glides an orbit camera around its target by `turns` full turns, in the
 * direction in which alpha grows. Distance, beta and target are left alone.
 *
 * interpolateArcRotateCamera moves alpha along the shortest arc modulo 2π, so a
 * goal of `start + 2π·turns` would look like "no movement". The spin is therefore
 * split into consecutive steps, each strictly less than π, and run one after
 * another. Each step is an ordinary library interpolation, so it keeps the
 * library's easing; the steps join with a brief pause at each boundary.
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number,
): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite, non-negative number (got ${turns})`);
    }
    if (turns === 0) {
        return;
    }

    const start = camera.alpha;
    const sweep = TWO_PI * turns;
    const end = start + sweep;

    // Limits clamp each interpolation goal. Every goal lies between start and end,
    // so if both ends are inside the limits the spin can reach its target.
    const lower = camera.lowerAlphaLimit;
    const upper = camera.upperAlphaLimit;
    if ((lower !== undefined && (start < lower || end < lower)) ||
        (upper !== undefined && (start > upper || end > upper))) {
        throw new RangeError("spinAround: alpha limits would clamp the spin before it completes");
    }

    // floor(2·turns) + 1 steps guarantees each step is strictly less than π.
    const steps = Math.floor(2 * turns) + 1;
    for (let i = 1; i <= steps; i++) {
        const goal = i === steps ? end : start + (sweep * i) / steps;
        await interpolateArcRotateCamera(camera, scene, { alpha: goal });
    }
}
