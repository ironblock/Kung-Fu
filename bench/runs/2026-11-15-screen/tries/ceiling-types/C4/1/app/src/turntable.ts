import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const FULL_TURN = 2 * Math.PI;

/**
 * `interpolateArcRotateCamera` always moves alpha along the *shortest* arc to its goal. A goal a
 * whole number of turns away therefore counts as already reached (the camera doesn't move), and a
 * goal more than half a turn ahead is reached by going backwards. The spin is therefore split into
 * equal legs of at most a third of a turn. For each leg the shortest arc is the forward one, with a
 * wide margin from the ambiguous half turn.
 */
const LEGS_PER_TURN = 3;

/**
 * Orbits `camera` around its target by `turns` full turns, always in the direction in which `alpha`
 * grows, using the library's own camera transition. Radius, beta and target are left as they are.
 *
 * Resolves once the camera has arrived, with `alpha` exactly equal to its starting value plus
 * `2π · turns`. Rejects if the transition is interrupted (user input, another transition, a direct
 * pose write) or if the camera's `upperAlphaLimit` would stop it short.
 */
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
    }

    const start = camera.alpha;
    const sweep = FULL_TURN * turns;
    const end = start + sweep;
    if (end === start) return;

    // The alpha setter clamps to the upper limit, so the camera could never arrive.
    if (camera.upperAlphaLimit !== undefined && end > camera.upperAlphaLimit) {
        throw new RangeError(
            `spinAround: target alpha ${end} is beyond the camera's upperAlphaLimit (${camera.upperAlphaLimit})`,
        );
    }

    const legs = Math.ceil(turns * LEGS_PER_TURN);
    for (let leg = 1; leg <= legs; leg++) {
        // Goals are measured from `start`, so a leg that settles a hair short doesn't accumulate error.
        const goal = leg === legs ? end : start + (sweep * leg) / legs;
        // Only alpha is given: omitted fields keep the camera's current radius, beta and target.
        await interpolateArcRotateCamera(camera, scene, { alpha: goal });
    }

    // The library may finish on an equivalent angle (wrapped by 2π, or within its own arrival
    // tolerance) instead of this exact number. The view is the same, so this write doesn't move it.
    if (camera.alpha !== end) camera.alpha = end;
}
