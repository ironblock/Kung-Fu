import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Angles are read back wrapped to [-PI, PI), so compare them by angular distance.
const ANGLE_TOLERANCE = 1e-4;

// Latest flight started through flyToPlace, per camera. A newer call makes older ones report false.
const latestFlightByCamera = new WeakMap<GeospatialCamera, number>();
let flightCounter = 0;

function angularDistance(a: number, b: number): number {
    const d = a - b;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const tol = 1e-6 * Math.max(1, camera.limits.planetRadius);
    const c = camera.center;
    const p = place.center;
    return (
        angularDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angularDistance(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= tol &&
        Math.abs(c.x - p.x) <= tol &&
        Math.abs(c.y - p.y) <= tol &&
        Math.abs(c.z - p.z) <= tol
    );
}

/**
 * Flies the camera to `place` over about `durationMs`, driven by the scene's render loop.
 * Resolves true if the camera ended at the place, false if the flight was cut short
 * (by a newer flyToPlace call, by input, or by any other fly-to). Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    const flightId = ++flightCounter;
    latestFlightByCamera.set(camera, flightId);
    try {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
        // A newer flyToPlace on this camera has started: this flight was stopped.
        if (latestFlightByCamera.get(camera) !== flightId) return false;
        // Flights cut short by other code resolve too, so check the pose.
        return isAtPlace(camera, place);
    } catch {
        return false;
    }
}
