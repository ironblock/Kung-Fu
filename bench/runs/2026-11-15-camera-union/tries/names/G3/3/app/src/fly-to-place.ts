import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance used when comparing the camera pose to the target place.
const REL_TOLERANCE = 1e-6;

function tol(value: number): number {
    return REL_TOLERANCE * Math.max(1, Math.abs(value));
}

/** Smallest absolute difference between two angles, in radians. */
function angleDelta(a: number, b: number): number {
    const twoPi = 2 * Math.PI;
    let d = (a - b) % twoPi;
    if (d > Math.PI) d -= twoPi;
    if (d < -Math.PI) d += twoPi;
    return Math.abs(d);
}

/**
 * The library's fly promise carries no outcome (it resolves with void and
 * there is no abort signal), so arrival is decided by comparing the camera's
 * actual pose with the requested place once the flight has ended.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const c = camera.center;
    const p = place.center;
    const centerDistance = Math.hypot(c.x - p.x, c.y - p.y, c.z - p.z);

    return (
        angleDelta(camera.yaw, place.yaw) <= tol(place.yaw) &&
        angleDelta(camera.pitch, place.pitch) <= tol(place.pitch) &&
        Math.abs(camera.radius - place.radius) <= tol(place.radius) &&
        centerDistance <= tol(Math.hypot(p.x, p.y, p.z))
    );
}

/**
 * Flies the geospatial camera to `place` over roughly `durationMs`, driven by
 * the scene's render loop. Resolves once the flight has ended and never
 * rejects: `true` if the camera is at the place, `false` otherwise (for
 * example, when the flight was stopped by another fly-to).
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
            center: place.center,
            durationMs,
        });
    } catch {
        // A rejected flight counts as stopped; the pose check below decides the result.
    }

    return isAtPlace(camera, place);
}
