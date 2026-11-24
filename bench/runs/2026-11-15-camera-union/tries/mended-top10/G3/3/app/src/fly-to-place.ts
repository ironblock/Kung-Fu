import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Tolerances used to decide whether the camera actually reached the place.
const ANGLE_TOLERANCE = 1e-4; // radians
const RELATIVE_TOLERANCE = 1e-4; // fraction of the place radius / planet radius

/** Smallest absolute difference between two angles, in radians. */
function angleDiff(a: number, b: number): number {
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/**
 * True when the camera's current pose matches the place.
 * The library's fly promise does not tell us whether the flight arrived or
 * was superseded, so we compare the final pose against the requested place.
 */
function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;
    const radiusTol = RELATIVE_TOLERANCE * Math.max(place.radius, 1);
    const centerTol = RELATIVE_TOLERANCE * Math.max(planetRadius, 1);

    return (
        angleDiff(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDiff(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= radiusTol &&
        Math.abs(camera.center.x - place.center.x) <= centerTol &&
        Math.abs(camera.center.y - place.center.y) <= centerTol &&
        Math.abs(camera.center.z - place.center.z) <= centerTol
    );
}

/**
 * Smoothly flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended at the place, `false` if the flight was
 * stopped before reaching it (another fly-to started, or the flight failed).
 * Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    try {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        // Cancelled or failed flight: the camera did not get there.
        return false;
    }

    return hasArrived(camera, place);
}
