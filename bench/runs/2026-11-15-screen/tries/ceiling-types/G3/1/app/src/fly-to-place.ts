import { clampCenterFromPoles, flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

type XYZ = { x: number; y: number; z: number };

/**
 * How close the camera must end up to count as having arrived: radians for angles, a
 * fraction of the goal's size for lengths. A finished flight lands on its goal to within
 * rounding error; a flight stopped part-way is normally far outside this.
 */
const ARRIVAL_TOLERANCE = 1e-6;

/** Number of the latest flyToPlace flight per camera, so an older call can tell it was superseded. */
const latestFlight = new WeakMap<GeospatialCamera, number>();

/**
 * Fly `camera` to `place` over about `durationMs`, driven by `scene`'s render loop.
 *
 * Resolves `true` if the camera arrived at the place, or `false` if the flight was stopped
 * before it got there (user input through the geospatial controls, or another fly-to started
 * by this function or anything else). Never rejects; an unexpected error resolves `false`.
 */
export async function flyToPlace(camera: GeospatialCamera, scene: SceneContext, place: Place, durationMs: number): Promise<boolean> {
    try {
        // flyGeospatialCameraToAsync resolves the same way whether the flight finished or was
        // interrupted, so its promise alone can't tell us which happened. Note the camera's
        // in-flight cancel hook around the call, to see later whether another flight replaced it.
        const cancelBefore = camera._cancelFly;
        const flight = flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            // Copy, so a caller mutating its Place mid-flight can't move the goal.
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            // Guard against 0 / negative / NaN, which could make the library compute 0/0 progress.
            durationMs: durationMs > 0 ? durationMs : 1,
        });
        const ownCancel = camera._cancelFly;
        const flightNumber = (latestFlight.get(camera) ?? 0) + 1;
        latestFlight.set(camera, flightNumber);

        await flight;

        // Superseded by a later flyToPlace on this camera.
        if (latestFlight.get(camera) !== flightNumber) return false;

        // Superseded by some other fly-to (e.g. a double-click handled by the controls): a
        // different flight's cancel hook is installed now. Only trusted if our call visibly
        // installed its own hook.
        const currentCancel = camera._cancelFly;
        if (ownCancel !== undefined && ownCancel !== cancelBefore && currentCancel !== undefined && currentCancel !== ownCancel) {
            return false;
        }

        // Stopped by user input: the camera is left short of the place. Finished: it is there.
        return isAtPlace(camera, place);
    } catch {
        return false;
    }
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    if (!sameAngle(camera.yaw, place.yaw) || !sameAngle(camera.pitch, place.pitch)) return false;
    if (!sameLength(camera.radius, place.radius)) return false;
    if (samePoint(camera.center, place.center)) return true;
    // The camera may keep its centre nudged off a geographic pole; accept that spot too.
    return samePoint(camera.center, clampCenterFromPoles({ x: place.center.x, y: place.center.y, z: place.center.z }));
}

/** Angles are compared modulo 2π, since the camera wraps yaw and pitch to [-π, π). */
function sameAngle(a: number, b: number): boolean {
    const d = Math.abs(a - b) % (2 * Math.PI);
    return Math.min(d, 2 * Math.PI - d) <= ARRIVAL_TOLERANCE;
}

function sameLength(actual: number, goal: number): boolean {
    return Math.abs(actual - goal) <= ARRIVAL_TOLERANCE * Math.max(Math.abs(goal), 1);
}

function samePoint(actual: XYZ, goal: XYZ): boolean {
    const distance = Math.hypot(actual.x - goal.x, actual.y - goal.y, actual.z - goal.z);
    return distance <= ARRIVAL_TOLERANCE * Math.max(Math.hypot(goal.x, goal.y, goal.z), 1);
}
