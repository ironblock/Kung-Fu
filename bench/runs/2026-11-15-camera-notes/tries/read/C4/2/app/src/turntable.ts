import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// interpolateArcRotateCamera moves alpha along the shortest arc to the goal.
// A single goal a whole turn (or more than half a turn) away would therefore
// go the wrong way or not move at all. The sweep is split into equal pieces of
// at most a quarter turn, each of which is unambiguously in the +alpha
// direction, and the pieces are run one after another.
const MAX_PIECE = Math.PI / 2;

/**
 * Glides the orbit camera `turns` full turns in the direction in which alpha
 * grows. Distance, height angle and target are kept as they were at the call.
 * Resolves once alpha equals its starting value plus 2π · turns.
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number,
): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite, non-negative number, got ${turns}`);
    }

    const startAlpha = camera.alpha;
    const sweep = 2 * Math.PI * turns;
    const endAlpha = startAlpha + sweep;
    const pieces = Math.ceil(sweep / MAX_PIECE);
    if (pieces === 0) {
        return;
    }

    // Hold the distance, height angle and look-at point fixed for the whole tour.
    const beta = camera.beta;
    const radius = camera.radius;
    const target = { x: camera.target.x, y: camera.target.y, z: camera.target.z };

    for (let k = 1; k <= pieces; k++) {
        const goalAlpha = k === pieces ? endAlpha : startAlpha + (sweep * k) / pieces;
        await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha, beta, radius, target });
    }
}
