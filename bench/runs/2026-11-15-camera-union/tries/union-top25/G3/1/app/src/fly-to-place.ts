import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

// Relative tolerance for lengths (radius, center) and absolute tolerance for angles (radians).
const LENGTH_REL_EPS = 1e-6;
const ANGLE_EPS = 1e-6;
const TWO_PI = Math.PI * 2;

/** True when two angles are equal modulo 2*PI, within eps. */
function anglesClose(a: number, b: number, eps: number): boolean {
    let d = (a - b) % TWO_PI;
    if (d > Math.PI) d -= TWO_PI;
    if (d < -Math.PI) d += TWO_PI;
    return Math.abs(d) <= eps;
}

/**
 * Checks whether the camera's current pose is the requested place.
 * The flight promise does not say whether the flight completed or was cut short,
 * so the final pose is compared against the target instead.
 */
function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
    const c = place.center;
    const scale = Math.max(
        1,
        Math.abs(place.radius),
        Math.hypot(c.x, c.y, c.z),
    );
    const lengthEps = LENGTH_REL_EPS * scale;

    return (
        anglesClose(camera.yaw, place.yaw, ANGLE_EPS) &&
        Math.abs(camera.pitch - place.pitch) <= ANGLE_EPS &&
        Math.abs(camera.radius - place.radius) <= lengthEps &&
        Math.abs(camera.center.x - c.x) <= lengthEps &&
        Math.abs(camera.center.y - c.y) <= lengthEps &&
        Math.abs(camera.center.z - c.z) <= lengthEps
    );
}

/**
 * Flies the geospatial camera to `place` over about `durationMs`, driven by the scene's render loop.
 *
 * Resolves `true` if the camera ends at `place`, `false` if the flight was stopped before
 * arriving (another fly-to, user input, or an error). Never rejects.
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
