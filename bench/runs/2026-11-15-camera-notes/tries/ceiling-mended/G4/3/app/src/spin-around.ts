import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * flyGeospatialCameraToAsync always turns yaw the short way round, so one flight
 * cannot make a full turn (a goal of start + 2*PI is no turn at all). The turn is
 * flown as consecutive legs, each well under half a turn so the short way is
 * always the eastward way. Three legs of 120 degrees is the fewest that keeps
 * clear of the ambiguous 180-degree case.
 */
const LEGS = 3;

/** A leg counts as finished when yaw is this close (radians) to its goal. */
const ARRIVAL_TOLERANCE = 1e-6;

/** Sine ease-in-out over the whole turn: share of the turn done at time share t. */
function easeInOut(t: number): number {
    return (1 - Math.cos(Math.PI * t)) / 2;
}

/** Inverse of easeInOut: time share at which share y of the turn is done. */
function easeInOutInverse(y: number): number {
    return Math.acos(1 - 2 * y) / Math.PI;
}

/** Wraps an angle into [-PI, PI), the range a geospatial camera reads yaw back in. */
function wrapAngle(angle: number): number {
    return angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI);
}

/**
 * Turns the camera's heading once round, eastward (increasing yaw), over about
 * `durationMs` of the scene's render loop, easing in and out. Center, pitch and
 * radius are left alone, and the camera ends on the yaw it started with.
 *
 * The legs share one easing curve, so the speed carries on smoothly from one leg
 * into the next instead of stopping at each join.
 *
 * If the spin is cut short (input through attachGeospatialControls, or another
 * flight started on this camera), it stops where it was and the promise resolves
 * early, as flyGeospatialCameraToAsync's own promise does. It does not turn
 * again against the user.
 */
export async function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
        throw new RangeError(`spinAround: durationMs must be a positive number, got ${durationMs}`);
    }

    const startYaw = camera.yaw;

    for (let leg = 0; leg < LEGS; leg++) {
        // Share of the full turn at the start and end of this leg, and the time
        // shares at which the overall ease reaches them.
        const turnFrom = leg / LEGS;
        const turnTo = (leg + 1) / LEGS;
        const timeFrom = easeInOutInverse(turnFrom);
        const timeTo = easeInOutInverse(turnTo);

        // The last leg aims at the exact starting yaw, so no rounding drift builds up.
        const goalYaw = leg === LEGS - 1 ? startYaw : wrapAngle(startYaw + TWO_PI * turnTo);

        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: goalYaw,
            durationMs: (timeTo - timeFrom) * durationMs,
            // Map this leg's progress g onto its piece of the overall ease curve.
            ease: (g: number): number => {
                if (g <= 0) return 0;
                if (g >= 1) return 1;
                const turn = easeInOut(timeFrom + g * (timeTo - timeFrom));
                return Math.min(1, Math.max(0, (turn - turnFrom) / (turnTo - turnFrom)));
            },
        });

        // The flight resolves (it never rejects) when it is cut short, so check
        // that it actually arrived before flying the next leg.
        if (Math.abs(wrapAngle(camera.yaw - goalYaw)) > ARRIVAL_TOLERANCE) {
            return;
        }
    }

    // Land exactly on the starting heading, in case the last frame left a rounding error.
    if (camera.yaw !== startYaw) {
        camera.yaw = startYaw;
    }
}
