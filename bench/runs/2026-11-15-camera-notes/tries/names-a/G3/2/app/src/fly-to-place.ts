import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

/** Angular tolerance (radians) for deciding the camera reached a place. */
const ANGLE_EPSILON = 1e-4;
/** Relative tolerance for radius and center, scaled by their magnitude. */
const RELATIVE_EPSILON = 1e-6;

/**
 * The most recent flight started through this module, per camera. A flight
 * whose token is no longer current was superseded by a newer call here.
 */
const currentFlight = new WeakMap<GeospatialCamera, object>();

/**
 * Flies the camera smoothly to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ended up at `place`, and `false` if the flight
 * was stopped before arriving (superseded by another fly-to, or interrupted by
 * anything else). Never rejects.
 *
 * The underlying flight API reports no outcome, so arrival is decided by
 * comparing the camera's final pose with `place`.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    const token = {};
    currentFlight.set(camera, token);

    // Wrap in a Promise so a synchronous throw becomes a rejection we can handle.
    const flight = new Promise<void>((resolve) => {
        resolve(
            flyGeospatialCameraToAsync(camera, scene, {
                yaw: place.yaw,
                pitch: place.pitch,
                radius: place.radius,
                center: { x: place.center.x, y: place.center.y, z: place.center.z },
                durationMs,
            }),
        );
    });

    return flight.then(
        () => {
            const isCurrent = currentFlight.get(camera) === token;
            if (isCurrent) currentFlight.delete(camera);
            return isCurrent && isAtPlace(camera, place);
        },
        () => {
            if (currentFlight.get(camera) === token) currentFlight.delete(camera);
            return false;
        },
    );
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const c = camera.center;
    const centerScale = Math.max(1, Math.hypot(place.center.x, place.center.y, place.center.z));
    const radiusScale = Math.max(1, Math.abs(place.radius));

    return (
        angleDelta(camera.yaw, place.yaw) <= ANGLE_EPSILON &&
        angleDelta(camera.pitch, place.pitch) <= ANGLE_EPSILON &&
        Math.abs(camera.radius - place.radius) <= RELATIVE_EPSILON * radiusScale &&
        Math.abs(c.x - place.center.x) <= RELATIVE_EPSILON * centerScale &&
        Math.abs(c.y - place.center.y) <= RELATIVE_EPSILON * centerScale &&
        Math.abs(c.z - place.center.z) <= RELATIVE_EPSILON * centerScale
    );
}

/** Smallest absolute difference between two angles, in radians. */
function angleDelta(a: number, b: number): number {
    const d = a - b;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
}
