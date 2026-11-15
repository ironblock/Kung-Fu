import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Tolerances for deciding whether the camera ended at the place. Angles are in
// radians; lengths are relative to the magnitude involved, so they stay sensible
// for both a unit planet and a planet with a radius of several million units
// (where float32 precision is coarse in absolute terms).
const ANGLE_TOLERANCE = 1e-5;
const LENGTH_RELATIVE_TOLERANCE = 1e-6;

/** Smallest absolute difference between two angles, handling the [-PI, PI) wrap. */
function angleDistance(a: number, b: number): number {
    const d = a - b;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
}

/**
 * The flight promise resolves both on arrival and when the flight is cut short,
 * so arrival is judged from where the camera actually is.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const { center } = camera;
    const centerScale = Math.max(1, Math.hypot(place.center.x, place.center.y, place.center.z));
    const centerDistance = Math.hypot(
        center.x - place.center.x,
        center.y - place.center.y,
        center.z - place.center.z,
    );
    const radiusScale = Math.max(1, place.radius);

    return (
        angleDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDistance(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= LENGTH_RELATIVE_TOLERANCE * radiusScale &&
        centerDistance <= LENGTH_RELATIVE_TOLERANCE * centerScale
    );
}

/**
 * Smoothly flies the geospatial camera to `place`, driven by the scene's render loop.
 *
 * Resolves `true` if the camera ended at `place`, and `false` if the flight was
 * stopped short (by another fly-to, or by user input). Never rejects.
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
        return false;
    }
    return isAtPlace(camera, place);
}
