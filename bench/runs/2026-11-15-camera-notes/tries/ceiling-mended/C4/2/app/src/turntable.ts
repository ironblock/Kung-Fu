import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Largest alpha change asked of one interpolateArcRotateCamera call.
 *
 * The notes don't say whether interpolateArcRotateCamera goes the short way
 * round for alpha. If it does, a goal a whole turn away would not move the
 * camera, and one 0.75 turn away would turn it backwards. With every leg well
 * under half a turn, the short way and the forward way are the same, so the
 * camera turns forward whichever way the library behaves. A quarter turn also
 * keeps each leg's first eased step no bigger than in an ordinary 90° camera
 * move, so a two-turn tour does not lurch on its first frame.
 */
const MAX_LEG = Math.PI / 2;

/** Largest leftover gap (radians, about 0.06°) closed by one direct write at the end. */
const ARRIVAL_TOLERANCE = 1e-3;

/**
 * Glides the camera `turns` full turns around its target, always towards
 * growing alpha, using the library's camera-transition easing. Beta, radius
 * and target are not touched. Resolves with
 * `camera.alpha === startAlpha + 2π·turns`.
 */
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
    }

    const start = camera.alpha;
    const end = start + 2 * Math.PI * turns;
    const total = end - start;
    if (total <= 0) return;

    // Equal legs, each at most a quarter turn. The last goal is exactly `end`.
    const legs = Math.max(1, Math.ceil(total / MAX_LEG - 1e-9));
    const goals: number[] = [];
    for (let i = 1; i < legs; i++) goals.push(start + (total * i) / legs);
    goals.push(end);

    // interpolateArcRotateCamera clamps its alpha goal to the alpha limit fields,
    // even ones set by hand without setCameraLimits (notes 3 and 23). Fail before
    // moving anything rather than stall part way.
    const lower = camera.lowerAlphaLimit;
    const upper = camera.upperAlphaLimit;
    if ((typeof lower === "number" && goals[0] < lower) || (typeof upper === "number" && end > upper)) {
        throw new RangeError(
            `spinAround: alpha limits [${lower ?? "-∞"}, ${upper ?? "∞"}] do not allow ` +
                `${turns} turn(s) from alpha ${start}`,
        );
    }

    // Kill any leftover drag/wheel inertia now. interpolateArcRotateCamera only
    // zeroes these on its first frame (note 12), and attachControl's
    // before-render callback could use them up earlier in that frame, nudging
    // beta, radius or target.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    // The goal holds alpha only, so beta, radius and target stay as they are.
    // Nothing is written to the camera between legs: a write while a leg runs
    // would make that leg reject (note 12).
    for (const alpha of goals) {
        await interpolateArcRotateCamera(camera, scene, { alpha });
    }

    const gap = end - camera.alpha;
    if (Math.abs(gap) > ARRIVAL_TOLERANCE) {
        throw new Error(`spinAround: camera stopped at alpha ${camera.alpha}, expected ${end}`);
    }
    // Remove any rounding left by the last leg so alpha is exactly start + 2π·turns.
    if (gap !== 0) camera.alpha = end;
}
