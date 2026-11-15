import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

interface Flight {
    stop: () => void;
}

// The one flight of this module that is currently running, per camera.
const activeFlights = new WeakMap<GeospatialCamera, Flight>();

const ANGLE_TOLERANCE = 1e-3; // radians
const RELATIVE_TOLERANCE = 1e-3; // fraction of the place's radius
const CENTER_TOLERANCE_SCALE = 1e-6; // fraction of the planet radius

function angleDifference(a: number, b: number): number {
    let d = (a - b) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
}

// True if the camera's current pose is the place, within small tolerances.
// Used after the library's fly settles, since the fly's promise carries no result.
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const planetRadius = camera.limits.planetRadius;
    const radiusTol = RELATIVE_TOLERANCE * Math.max(1, place.radius);
    const centerTol = CENTER_TOLERANCE_SCALE * planetRadius;
    const c = camera.center;
    const p = place.center;

    return (
        angleDifference(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        angleDifference(camera.pitch, place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= radiusTol &&
        Math.abs(c.x - p.x) <= centerTol &&
        Math.abs(c.y - p.y) <= centerTol &&
        Math.abs(c.z - p.z) <= centerTol
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the
 * scene's render loop. Resolves `true` if the camera ended at the place, `false`
 * if the flight was stopped before reaching it (for example by another fly-to).
 * Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    // Starting a new flight stops this module's previous flight on the same camera.
    const previous = activeFlights.get(camera);
    if (previous) {
        activeFlights.delete(camera);
        previous.stop();
        camera._cancelFly?.();
    }

    return new Promise<boolean>((resolve) => {
        let done = false;

        const finish = (arrived: boolean): void => {
            if (done) return;
            done = true;
            if (activeFlights.get(camera) === flight) {
                activeFlights.delete(camera);
            }
            resolve(arrived);
        };

        const flight: Flight = {
            stop: () => finish(false),
        };
        activeFlights.set(camera, flight);

        const settle = (): void => finish(isAtPlace(camera, place));

        let libraryFlight: Promise<void>;
        try {
            libraryFlight = flyGeospatialCameraToAsync(camera, scene, {
                yaw: place.yaw,
                pitch: place.pitch,
                radius: place.radius,
                center: { x: place.center.x, y: place.center.y, z: place.center.z },
                durationMs,
            });
        } catch {
            settle();
            return;
        }

        // Whether the library's promise resolves or rejects, the pose decides the result.
        libraryFlight.then(settle, settle);
    });
}
