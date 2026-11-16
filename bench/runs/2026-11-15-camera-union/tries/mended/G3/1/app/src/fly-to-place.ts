import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place { yaw: number; pitch: number; radius: number; center: { x: number; y: number; z: number } }

// Angles in radians; the fly writes its final values exactly, so these only absorb float noise.
const ANGLE_EPSILON = 1e-4;
// Relative to the planet radius (centre) or to the radius itself.
const LENGTH_EPSILON = 1e-6;

/** Smallest absolute difference between two angles, so yaw wrapping at +-PI compares equal. */
function angleDelta(a: number, b: number): number {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/**
 * The fly promise resolves both on arrival and when a later fly (or a wheel event)
 * stops it early, so arrival is decided by checking where the camera ended up.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const planetScale = Math.max(1, camera.limits.planetRadius);
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    const centerDistance = Math.hypot(dx, dy, dz);

    return (
        angleDelta(camera.yaw, place.yaw) <= ANGLE_EPSILON &&
        angleDelta(camera.pitch, place.pitch) <= ANGLE_EPSILON &&
        Math.abs(camera.radius - place.radius) <= LENGTH_EPSILON * Math.max(1, Math.abs(place.radius)) &&
        centerDistance <= LENGTH_EPSILON * planetScale
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the scene's render loop.
 * Resolves `true` if the camera ended at `place`, `false` if the flight was stopped short
 * (another fly, a wheel event, etc.) or failed. Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    const center = { x: place.center.x, y: place.center.y, z: place.center.z };

    let flight: Promise<void>;
    try {
        flight = flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center,
            durationMs,
        });
    } catch {
        return Promise.resolve(false);
    }

    return flight.then(
        () => isAtPlace(camera, place),
        () => false
    );
}
