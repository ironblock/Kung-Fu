import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * interpolateArcRotateCamera eases alpha the short way round: a goal a whole
 * turn ahead is reached on the first frame without moving, and one more than
 * half a turn ahead is reached by turning backwards. So the spin is made of
 * equal legs of at most a third of a turn, each eased by the library.
 */
const LEGS_PER_TURN = 3;

const LIMIT_KEYS = [
    "lowerAlphaLimit",
    "upperAlphaLimit",
    "lowerBetaLimit",
    "upperBetaLimit",
    "lowerRadiusLimit",
    "upperRadiusLimit",
] as const;

const INERTIA_KEYS = [
    "inertialAlphaOffset",
    "inertialBetaOffset",
    "inertialRadiusOffset",
    "inertialPanningX",
    "inertialPanningY",
] as const;

/**
 * Glides the camera `turns` full turns around its target, with alpha growing,
 * keeping radius, beta and target as they are. Resolves once alpha equals its
 * starting value plus 2π·turns. Rejects if a leg is interrupted.
 */
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
    }
    if (turns === 0) {
        return;
    }

    // Stop coasting from an earlier drag, so it cannot shift the pose (or clamp
    // beta) before the first leg takes over.
    for (const key of INERTIA_KEYS) {
        if (camera[key]) {
            camera[key] = 0;
        }
    }

    const start = camera.alpha;
    const { beta, radius } = camera;
    const total = 2 * Math.PI * turns;
    const end = start + total;
    const legs = Math.max(1, Math.ceil(turns * LEGS_PER_TURN - 1e-9));

    // The interpolation clamps its goals to the limit fields even when the
    // current pose lies outside them, which would cut the spin short or change
    // radius/beta. Lift them for the tour; putting them back clamps nothing.
    const lifted: Array<[(typeof LIMIT_KEYS)[number], number]> = [];
    for (const key of LIMIT_KEYS) {
        const value = camera[key];
        if (value !== undefined) {
            lifted.push([key, value]);
            camera[key] = undefined;
        }
    }

    try {
        for (let leg = 1; leg <= legs; leg++) {
            const alpha = leg === legs ? end : start + (total * leg) / legs;
            await interpolateArcRotateCamera(camera, scene, { alpha, beta, radius });
        }
    } finally {
        for (const [key, value] of lifted) {
            camera[key] = value;
        }
    }
}
