import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Every call to flyToPlace for a camera takes a new generation number. A flight
// whose generation is no longer current was superseded by a later flyToPlace.
const generations = new WeakMap<GeospatialCamera, number>();

const ANGLE_TOLERANCE = 1e-4;
const RADIUS_RELATIVE_TOLERANCE = 1e-6;
const CENTER_RELATIVE_TOLERANCE = 1e-6;

function nearly(a: number, b: number, relTol: number): boolean {
    return Math.abs(a - b) <= relTol * Math.max(1, Math.abs(a), Math.abs(b));
}

function nearlyAngle(a: number, b: number): boolean {
    // Compare angles on the circle, so yaw values differing by 2π still match.
    const d = Math.atan2(Math.sin(a - b), Math.cos(a - b));
    return Math.abs(d) <= ANGLE_TOLERANCE;
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    return (
        nearlyAngle(camera.yaw, place.yaw) &&
        nearly(camera.pitch, place.pitch, ANGLE_TOLERANCE) &&
        nearly(camera.radius, place.radius, RADIUS_RELATIVE_TOLERANCE) &&
        nearly(camera.center.x, place.center.x, CENTER_RELATIVE_TOLERANCE) &&
        nearly(camera.center.y, place.center.y, CENTER_RELATIVE_TOLERANCE) &&
        nearly(camera.center.z, place.center.z, CENTER_RELATIVE_TOLERANCE)
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` only if the camera ended up at `place`;
 * resolves `false` if the flight was stopped early (for example by another
 * fly-to) or if the flight failed. Never rejects.
 *
 * The library's fly promise does not report whether a flight finished or was
 * cancelled, so arrival is decided by checking the camera's pose once the
 * promise settles, plus a generation check for flights started through this
 * function.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    const generation = (generations.get(camera) ?? 0) + 1;
    generations.set(camera, generation);

    let flight: Promise<void>;
    try {
        flight = flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        return Promise.resolve(false);
    }

    return flight.then(
        () => generations.get(camera) === generation && isAtPlace(camera, place),
        () => false,
    );
}
