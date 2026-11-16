import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import {
    GEO_EPSILON,
    clampCenterFromPoles,
    flyGeospatialCameraToAsync,
    getEffectivePitchMax,
} from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

const TWO_PI = Math.PI * 2;

// Signed shortest difference between two yaw/pitch angles, in [-PI, PI).
function angleDelta(a: number, b: number): number {
    let d = (a - b) % TWO_PI;
    if (d >= Math.PI) {
        d -= TWO_PI;
    } else if (d < -Math.PI) {
        d += TWO_PI;
    }
    return d;
}

// The fly promise resolves both when the flight finishes and when it is cut
// short, so arrival is decided by comparing the camera's pose with the place.
function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    const limits = camera.limits;
    const lengthTol = GEO_EPSILON * limits.planetRadius;

    // The camera clamps the centre away from the poles and the pitch by limits,
    // so compare against what the camera can actually represent.
    const expectedCenter = clampCenterFromPoles(place.center);
    const expectedPitch = Math.min(
        Math.max(place.pitch, limits.pitchMin),
        getEffectivePitchMax(limits, place.radius)
    );

    const c = camera.center;
    return (
        Math.abs(angleDelta(camera.yaw, place.yaw)) <= GEO_EPSILON &&
        Math.abs(camera.pitch - expectedPitch) <= GEO_EPSILON &&
        Math.abs(camera.radius - place.radius) <= lengthTol &&
        Math.abs(c.x - expectedCenter.x) <= lengthTol &&
        Math.abs(c.y - expectedCenter.y) <= lengthTol &&
        Math.abs(c.z - expectedCenter.z) <= lengthTol
    );
}

/**
 * Flies the camera to `place` over about `durationMs`, driven by the scene's
 * render loop. Resolves true if the camera arrived at the place, false if the
 * flight was stopped before it got there (another fly-to, user input, or an
 * error). Never rejects.
 */
export async function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number
): Promise<boolean> {
    try {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
        return hasArrived(camera, place);
    } catch {
        return false;
    }
}
