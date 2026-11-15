import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
/** One third of a turn. Each flight is shorter than π, so its shortest path is unambiguously eastward. */
const THIRD = TWO_PI / 3;
/** Tolerance (radians) for deciding whether a flight reached its target or was interrupted. */
const YAW_EPSILON = 1e-3;

/** Wrap an angle to [-π, π), the same range the camera uses for yaw. */
function wrapRadians(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

/** Ease-in with zero velocity at g=0 and unit velocity at g=1, so it joins a linear segment smoothly. */
function easeIn(g: number): number {
    return 2 * g * g - g * g * g;
}

/** Mirror of {@link easeIn}: unit velocity at g=0, zero velocity at g=1. */
function easeOut(g: number): number {
    return 1 - easeIn(1 - g);
}

function linear(g: number): number {
    return g;
}

/**
 * Turn the camera's heading (yaw) one full turn eastward over about `durationMs`,
 * then leave it facing the heading it started with. Centre, pitch and radius are unchanged.
 *
 * The turn is split into three 120° flights driven by `flyGeospatialCameraToAsync`, so each
 * flight takes the shortest path (always eastward, increasing yaw). Velocity is zero at the
 * start and end of the turn and continuous across the joins between flights.
 *
 * Resolves when the turn completes, or early if something else interrupts it (user input,
 * or another flight started on the same camera). Rejects if the camera has finite yaw limits,
 * since a full turn is then impossible.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
        throw new RangeError(`spinAround: durationMs must be a positive number, got ${durationMs}`);
    }
    if (Number.isFinite(camera.limits.yawMin) || Number.isFinite(camera.limits.yawMax)) {
        throw new Error("spinAround: camera has yaw limits, so a full turn cannot be made");
    }

    const startYaw = camera.yaw;
    const segmentMs = durationMs / 3;
    const eases = [easeIn, linear, easeOut];

    for (let k = 0; k < 3; k++) {
        const target = wrapRadians(startYaw + (k + 1) * THIRD);
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: target,
            durationMs: segmentMs,
            ease: eases[k],
        });
        // The flight resolves early if it was interrupted. Stop rather than fight the interrupter.
        if (Math.abs(wrapRadians(camera.yaw - target)) > YAW_EPSILON) {
            return;
        }
    }
}
