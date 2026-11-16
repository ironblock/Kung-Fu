import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Pose comparison tolerance: radians for angles, relative to scale for distances.
const TOLERANCE = 1e-6;

// The most recent flyToPlace call per camera. An earlier call still pending
// reports false, because its flight was superseded.
const latestFlight = new WeakMap<GeospatialCamera, object>();

/**
 * Flies the camera to `place` over about `durationMs`, driven by the scene's
 * render loop. Resolves true if the camera ended at `place`, false if the
 * flight was stopped first (by another fly-to, or by input). Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    const token = {};
    latestFlight.set(camera, token);

    try {
        // The library resolves (not rejects) when a flight is cut short, so the
        // outcome is decided by checking the pose below, not by the promise.
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

    if (latestFlight.get(camera) !== token) {
        return false;
    }
    return isAtPlace(camera, place);
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const scale = Math.max(
        1,
        place.radius,
        Math.hypot(place.center.x, place.center.y, place.center.z),
    );
    const near = (a: number, b: number) => Math.abs(a - b) <= TOLERANCE * scale;

    // yaw reads back wrapped to [-PI, PI), so compare the wrapped difference.
    const yawDiff = camera.yaw - place.yaw;
    const wrappedYawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));

    return (
        Math.abs(wrappedYawDiff) <= TOLERANCE &&
        Math.abs(camera.pitch - place.pitch) <= TOLERANCE &&
        near(camera.radius, place.radius) &&
        near(camera.center.x, place.center.x) &&
        near(camera.center.y, place.center.y) &&
        near(camera.center.z, place.center.z)
    );
}
