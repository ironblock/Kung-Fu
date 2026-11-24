import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";

const FULL_TURN = Math.PI * 2;

/**
 * The fly helper is given a yaw *target*, not a path. A target one full turn
 * away is the same heading as the start, so a single flight could stay put or
 * take the short way round. A quarter turn is well under half a turn, so each
 * leg goes toward increasing yaw whether the helper interpolates the raw
 * numbers or takes the shortest path.
 */
const LEGS = 4;
const LEG_ANGLE = FULL_TURN / LEGS;

/** How close (radians) a leg must land to its target to count as completed. */
const LANDING_TOLERANCE = 0.01;

/** Ease-in-out for the whole turn: fraction of the turn done at time fraction t. */
function easeTurn(t: number): number {
    return (1 - Math.cos(Math.PI * t)) / 2;
}

/** Inverse of easeTurn: time fraction at which fraction a of the turn is done. */
function easeTurnInverse(a: number): number {
    return Math.acos(1 - 2 * a) / Math.PI;
}

/** Signed difference a - b, wrapped into [-π, π). */
function angleDiff(a: number, b: number): number {
    let d = (a - b) % FULL_TURN;
    if (d >= Math.PI) d -= FULL_TURN;
    else if (d < -Math.PI) d += FULL_TURN;
    return d;
}

/**
 * Turns the camera's heading one full turn eastward (increasing yaw) around its
 * current centre over about `durationMs`, easing in and out, driven by the
 * scene's render loop. Centre, pitch and radius are left alone. Resolves once
 * the turn is complete, with yaw set back to exactly its starting value.
 *
 * If a leg is cut short (the user takes the controls, another flight starts,
 * or yaw limits block the turn) the spin stops where it is and resolves.
 */
export async function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
        throw new RangeError(`spinAround: durationMs must be a positive number, got ${durationMs}`);
    }

    const startYaw = camera.yaw;

    for (let leg = 0; leg < LEGS; leg++) {
        // Each leg covers an equal quarter of the angle but traces its own slice
        // of the single whole-turn ease curve, so speed carries smoothly across
        // legs instead of stopping at every quarter.
        const t0 = easeTurnInverse(leg / LEGS);
        const t1 = easeTurnInverse((leg + 1) / LEGS);
        // Build on the yaw the camera actually holds, in case it stores yaw wrapped.
        const target = camera.yaw + LEG_ANGLE;

        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: target,
            durationMs: durationMs * (t1 - t0),
            centerHopScale: 0,
            ease: (g) => {
                if (g <= 0) return 0;
                if (g >= 1) return 1;
                return easeTurn(t0 + g * (t1 - t0)) * LEGS - leg;
            },
        });

        if (Math.abs(angleDiff(camera.yaw, target)) > LANDING_TOLERANCE) {
            // Interrupted: don't fight whoever took over the camera.
            return;
        }
    }

    // Same heading as now (start + one full turn); restore the exact starting number.
    setGeospatialOrientation(camera, { yaw: startYaw });
}
