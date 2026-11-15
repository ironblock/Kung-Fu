import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * Largest yaw step given to one flight. It is kept well under PI so the step goes
 * forward whether the flight interpolates the numbers as given or takes the
 * shortest way round.
 */
const MAX_STEP = TWO_PI / 3;

/**
 * The camera keeps yaw wrapped to [-PI, PI), so +PI reads back as -PI. Flights stop
 * this far short of +PI, and the spin writes -PI itself, so no single flight
 * crosses the seam (where a flight could otherwise turn the long way, backward).
 */
const SEAM_GAP = 1e-9;

/** Steps shorter than this (radians) are written directly instead of flown. */
const MIN_FLIGHT = 1e-4;

/** If a flight ends further than this from its goal, something else cut it short. */
const INTERRUPT_TOLERANCE = 1e-3;

function clamp01(x: number): number {
    return x <= 0 ? 0 : x >= 1 ? 1 : x;
}

/** Sine ease-in-out applied to the whole turn. */
function easeInOut(u: number): number {
    return (1 - Math.cos(Math.PI * u)) / 2;
}

function inverseEaseInOut(e: number): number {
    return Math.acos(1 - 2 * clamp01(e)) / Math.PI;
}

/** Wraps an angle to [-PI, PI), the range the camera keeps yaw in. */
function wrapAngle(a: number): number {
    return a - TWO_PI * Math.floor((a + Math.PI) / TWO_PI);
}

/**
 * Turns the camera's heading once around its centre, eastward (always toward
 * increasing yaw), over about `durationMs` of the scene's render loop, easing in and
 * out. Centre, pitch and radius are not touched. The heading ends exactly where it
 * started.
 *
 * The turn is a chain of flyGeospatialCameraToAsync steps. So, like that function,
 * it stops where it is and resolves early if something else takes the camera
 * mid-turn (another flight, or wheel input through attachGeospatialControls).
 * Await any flight to the place before calling this, or this will cut that flight
 * short.
 */
export async function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
        throw new RangeError(`spinAround: durationMs must be a finite number >= 0, got ${durationMs}`);
    }
    const startYaw = wrapAngle(camera.yaw);
    if (durationMs === 0) {
        return;
    }

    // Angle turned so far (0..2PI) at the moment the heading reaches the +PI / -PI seam.
    const seam = Math.PI - startYaw;

    // Flies the heading from turned angle `from` to `to`, ending exactly on `goal` (a
    // yaw in [-PI, PI)). Each step's ease is its slice of the whole-turn curve, so the
    // speed carries smoothly from one step to the next. Returns false if the step was
    // cut short.
    const flyStep = async (from: number, to: number, goal: number): Promise<boolean> => {
        if (to - from < MIN_FLIGHT) {
            camera.yaw = goal;
            return true;
        }
        const u0 = inverseEaseInOut(from / TWO_PI);
        const u1 = inverseEaseInOut(to / TWO_PI);
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: goal,
            durationMs: (u1 - u0) * durationMs,
            ease: (g) => {
                if (g <= 0) return 0;
                if (g >= 1) return 1;
                const turned = TWO_PI * easeInOut(u0 + (u1 - u0) * g);
                return clamp01((turned - from) / (to - from));
            },
        });
        return Math.abs(wrapAngle(camera.yaw - goal)) <= INTERRUPT_TOLERANCE;
    };

    // Covers turned angles [from, to] in equal steps no longer than MAX_STEP, inside
    // one side of the seam. `yawAt` maps a turned angle to its yaw.
    const flyLeg = async (
        from: number,
        to: number,
        yawAt: (turned: number) => number,
        lastGoal: number,
    ): Promise<boolean> => {
        const length = to - from;
        if (length <= 0) {
            return true;
        }
        const count = Math.ceil(length / MAX_STEP);
        let at = from;
        for (let i = 1; i <= count; i++) {
            const next = i === count ? to : from + (length * i) / count;
            const goal = i === count ? lastGoal : yawAt(next);
            if (!(await flyStep(at, next, goal))) {
                return false;
            }
            at = next;
        }
        return true;
    };

    // From the start heading up to just short of +PI...
    if (!(await flyLeg(0, seam, (turned) => startYaw + turned, Math.PI - SEAM_GAP))) {
        return;
    }
    // ...over the seam (a forward step of SEAM_GAP)...
    camera.yaw = -Math.PI;
    // ...and from -PI back up to the start heading.
    if (!(await flyLeg(seam, TWO_PI, (turned) => -Math.PI + (turned - seam), startYaw))) {
        return;
    }
    if (camera.yaw !== startYaw) {
        camera.yaw = startYaw;
    }
}
