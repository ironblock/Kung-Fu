import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

/** How close yaw and pitch (radians) must be to count as arrived. Yaw is compared modulo 2π. */
const ANGLE_TOLERANCE = 1e-3;
/** How close radius and center must be, as a fraction of the place's radius (its viewing distance). */
const DISTANCE_TOLERANCE = 1e-3;
/** Allowance for rounding error in planet-scale coordinates, relative to their magnitude. */
const FLOAT_NOISE = 1e-9;

/** Smallest duration handed to the library, so a 0 or NaN duration can't become a 0/0 progress. */
const MIN_FLIGHT_MS = 1;

/** Safety net: how long past `durationMs` before we stop waiting on the library's promise... */
const FALLBACK_GRACE_MS = 2000;
/** ...and how long the camera must then have been motionless. */
const FALLBACK_STILL_MS = 1000;
/** A longer gap between our polls (hidden tab, blocked thread) means we weren't watching: restart the still-timer. */
const MAX_POLL_GAP_MS = 250;
const TIMER_FRAME_MS = 16;

/**
 * Flies `camera` to `place` over about `durationMs`, animated by the scene's render loop.
 *
 * Resolves `true` if the camera is at `place` when the flight ends, `false` if the flight was stopped
 * before it got there (another fly-to, user input, ...). Never rejects.
 *
 * `flyGeospatialCameraToAsync` only returns `Promise<void>`: it says the flight is over, not whether it
 * finished or was cut short (and an interrupted flight may resolve, reject, or never settle). So arrival
 * is decided by comparing the camera with the place at the moment the flight ends.
 */
export function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    // Our own copy: later edits to `place`, or the library adjusting the object we hand it, can't move the goal.
    const goal: Place = {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: { x: place.center.x, y: place.center.y, z: place.center.z },
    };
    const flightMs = durationMs > 0 ? durationMs : MIN_FLIGHT_MS;

    return new Promise<boolean>((resolve) => {
        let settled = false;
        let stopWatching: (() => void) | undefined;

        // The flight is over: report whether it left the camera at the place.
        const finish = (): void => {
            if (settled) return;
            settled = true;
            stopWatching?.();
            stopWatching = undefined;
            resolve(isAt(camera, goal));
        };

        try {
            const flight = flyGeospatialCameraToAsync(camera, scene, {
                yaw: goal.yaw,
                pitch: goal.pitch,
                radius: goal.radius,
                center: { ...goal.center },
                durationMs: flightMs,
            });
            // Settles when the flight completes and, presumably, when it is cancelled; resolution or
            // rejection alike just mean "over" to us.
            Promise.resolve(flight).then(finish, finish);
        } catch {
            finish();
            return;
        }

        // Safety net in case the library drops a cancelled flight's promise without settling it: once the
        // flight is well overdue and the camera has stopped moving, the flight is over either way.
        // This only reads the camera; the flight itself is driven entirely by the library and the scene.
        const startedAt = now();
        let lastPollAt = startedAt;
        let lastPose = readPose(camera);
        let stillSince = startedAt;
        const poll = (): void => {
            stopWatching = undefined;
            if (settled) return;
            const t = now();
            const pose = readPose(camera);
            if (t - lastPollAt > MAX_POLL_GAP_MS || !samePose(pose, lastPose)) stillSince = t;
            lastPollAt = t;
            lastPose = pose;
            if (t - startedAt >= flightMs + FALLBACK_GRACE_MS && t - stillSince >= FALLBACK_STILL_MS) {
                finish();
            } else {
                stopWatching = nextFrame(poll);
            }
        };
        stopWatching = nextFrame(poll);
    });
}

function isAt(camera: GeospatialCamera, goal: Place): boolean {
    try {
        const { x, y, z } = goal.center;
        const c = camera.center;
        const radius = Math.abs(goal.radius);
        const distanceTolerance = DISTANCE_TOLERANCE * radius + FLOAT_NOISE * Math.max(Math.hypot(x, y, z), radius);
        // Written as `<=` so that NaN anywhere reads as "not there".
        return (
            angularDistance(camera.yaw, goal.yaw) <= ANGLE_TOLERANCE &&
            Math.abs(camera.pitch - goal.pitch) <= ANGLE_TOLERANCE &&
            Math.abs(camera.radius - goal.radius) <= distanceTolerance &&
            Math.hypot(c.x - x, c.y - y, c.z - z) <= distanceTolerance
        );
    } catch {
        return false;
    }
}

/** Distance between two angles on the circle, in [0, π]; the camera may normalise yaw or land on yaw ± 2π. */
function angularDistance(a: number, b: number): number {
    const turn = 2 * Math.PI;
    const d = (((a - b) % turn) + turn) % turn;
    return Math.min(d, turn - d);
}

function readPose(camera: GeospatialCamera): number[] {
    const c = camera.center;
    return [camera.yaw, camera.pitch, camera.radius, c.x, c.y, c.z];
}

function samePose(a: readonly number[], b: readonly number[]): boolean {
    return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}

function nextFrame(callback: () => void): () => void {
    if (typeof requestAnimationFrame === "function") {
        const id = requestAnimationFrame(() => callback());
        return () => cancelAnimationFrame(id);
    }
    const id = setTimeout(callback, TIMER_FRAME_MS);
    return () => clearTimeout(id);
}

const now: () => number =
    typeof performance !== "undefined" && typeof performance.now === "function" ? () => performance.now() : () => Date.now();
