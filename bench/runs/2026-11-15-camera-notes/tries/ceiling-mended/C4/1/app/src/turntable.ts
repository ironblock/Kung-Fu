import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * interpolateArcRotateCamera always takes alpha the short way round
 * (camera-notes.md, 29). A single call aimed at `start + 2π·turns` would
 * therefore not move at all for 1 or 2 turns (the goal is the same pose) and
 * would turn backwards for 0.75. So the spin is split into legs of at most a
 * quarter turn. That keeps every leg well short of the half-turn point where
 * "short way" would mean going backwards.
 */
const LEGS_PER_TURN = 4;

/**
 * Glides `camera` around its target by `turns` full turns, always in the
 * direction of growing alpha, using the library's own camera-transition easing.
 * Only alpha is animated: radius, beta and target are never written.
 *
 * Resolves once the camera has arrived, with `alpha === start + 2π·turns`
 * (unwrapped). Rejects if something else moves the camera on the way, as
 * interpolateArcRotateCamera does.
 */
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
    }

    const start = camera.alpha;
    const total = 2 * Math.PI * turns;
    const end = start + total;
    if (total === 0) {
        return;
    }

    // interpolateArcRotateCamera obeys the alpha limit fields (camera-notes.md, 2),
    // so with limits like these the spin would stop at a limit and end at the
    // wrong alpha. Fail clearly before moving instead.
    const { lowerAlphaLimit: lower, upperAlphaLimit: upper } = camera;
    if ((lower != null && lower > start) || (upper != null && upper < end)) {
        throw new RangeError(
            `spinAround: alpha limits [${lower ?? "-inf"}, ${upper ?? "inf"}] do not allow alpha to go from ${start} to ${end}`,
        );
    }

    // The small tolerance stops float noise from adding an extra leg, e.g. 0.75 turns -> 3 legs.
    const legs = Math.max(1, Math.ceil(turns * LEGS_PER_TURN - 1e-9));

    // Each leg must finish before the next one starts: a second interpolation on
    // the camera rejects the first (camera-notes.md, 7). A leg ends with alpha
    // exactly on its unwrapped goal (camera-notes.md, 29), so every goal is
    // measured from `start` and the next leg starts where the last one stopped.
    // That means no drift and no jump between legs.
    for (let leg = 1; leg <= legs; leg++) {
        const alpha = leg === legs ? end : start + (total * leg) / legs;
        await interpolateArcRotateCamera(camera, scene, { alpha });
    }
}
