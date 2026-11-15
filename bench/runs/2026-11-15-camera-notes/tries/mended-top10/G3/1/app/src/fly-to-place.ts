import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Per-camera counter. Each call to flyToPlace on a camera takes a new number,
// so an older call on the same camera knows it was superseded.
const flightGeneration = new WeakMap<GeospatialCamera, number>();

const ANGLE_TOLERANCE = 1e-5; // radians
const RELATIVE_TOLERANCE = 1e-6;

function angleDifference(a: number, b: number): number {
    // Shortest signed difference, so yaw values that differ by 2*pi still match.
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const c = camera.center;
    const p = place.center;
    const centerError = Math.hypot(c.x - p.x, c.y - p.y, c.z - p.z);
    const centerScale = Math.max(1, Math.hypot(p.x, p.y, p.z));
    const radiusScale = Math.max(1, Math.abs(place.radius));

    return (
        centerError <= RELATIVE_TOLERANCE * centerScale &&
        angleDifference(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= RELATIVE_TOLERANCE * radiusScale
    );
}

/**
 * Smoothly flies the geospatial camera to `place`.
 *
 * Resolves `true` if the camera ends up at the place, and `false` if the flight
 * was stopped before reaching it (another fly-to on the same camera, or any
 * other fly that moved the camera). Never rejects.
 *
 * The library's fly promise resolves (it does not reject) when the flight is
 * interrupted, so arrival is decided by checking the camera's state after the
 * promise settles, not by the promise itself.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    const generation = (flightGeneration.get(camera) ?? 0) + 1;
    flightGeneration.set(camera, generation);

    return flyGeospatialCameraToAsync(camera, scene, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: { x: place.center.x, y: place.center.y, z: place.center.z },
        durationMs,
    }).then(
        () => flightGeneration.get(camera) === generation && isAtPlace(camera, place),
        () => false,
    );
}
