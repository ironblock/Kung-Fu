import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Tolerances for deciding whether the camera ended at the requested place.
const ANGLE_TOLERANCE = 1e-4; // radians, for yaw and pitch
const RELATIVE_TOLERANCE = 1e-4; // fraction of the place's radius, for radius and center
// Extra time after the flight's duration before we stop waiting for the library's promise.
const SETTLE_SLACK_MS = 1000;

function yawDistance(a: number, b: number): number {
    const twoPi = 2 * Math.PI;
    const d = Math.abs(a - b) % twoPi;
    return Math.min(d, twoPi - d);
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const tol = RELATIVE_TOLERANCE * Math.max(place.radius, Number.EPSILON);
    const dx = camera.center.x - place.center.x;
    const dy = camera.center.y - place.center.y;
    const dz = camera.center.z - place.center.z;
    return (
        yawDistance(camera.yaw, place.yaw) <= ANGLE_TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_TOLERANCE &&
        Math.abs(camera.radius - place.radius) <= tol &&
        Math.sqrt(dx * dx + dy * dy + dz * dz) <= tol
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`.
 *
 * Resolves `true` if the camera ends at `place`, `false` if the flight was
 * stopped before reaching it (for example, another fly-to replaced it).
 * Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        // The library's promise carries no arrived/stopped result, so decide by
        // comparing the camera's actual pose with the target once the flight ends.
        const settle = () => {
            if (settled) return;
            settled = true;
            if (timer !== undefined) clearTimeout(timer);
            resolve(isAtPlace(camera, place));
        };

        // Fallback so the promise always settles, even if the library's promise
        // never resolves when a flight is interrupted.
        timer = setTimeout(settle, Math.max(0, durationMs) + SETTLE_SLACK_MS);

        try {
            flyGeospatialCameraToAsync(camera, scene, {
                yaw: place.yaw,
                pitch: place.pitch,
                radius: place.radius,
                center: place.center,
                durationMs,
            }).then(settle, settle);
        } catch {
            settle();
        }
    });
}
