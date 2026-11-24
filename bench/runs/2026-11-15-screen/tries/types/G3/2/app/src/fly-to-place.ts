import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
    yaw: number;
    pitch: number;
    radius: number;
    center: { x: number; y: number; z: number };
}

/** Absolute tolerance for angles (radians). */
const ANGLE_EPSILON = 1e-6;
/** Relative tolerance for radius and centre (scaled by magnitude). */
const RELATIVE_EPSILON = 1e-6;

const TAU = Math.PI * 2;

/** Smallest absolute difference between two angles, in radians. */
function angleDelta(a: number, b: number): number {
    const d = (((a - b) % TAU) + TAU) % TAU;
    return Math.min(d, TAU - d);
}

/**
 * True when the camera's pose matches `place` to within floating-point
 * tolerance. The library reports only that a flight ended, not whether it
 * reached its target, so the pose is the only available signal.
 */
function hasArrived(camera: GeospatialCamera, place: Place): boolean {
    if (angleDelta(camera.yaw, place.yaw) > ANGLE_EPSILON) return false;
    if (angleDelta(camera.pitch, place.pitch) > ANGLE_EPSILON) return false;

    const radiusScale = Math.max(1, Math.abs(place.radius));
    if (Math.abs(camera.radius - place.radius) > RELATIVE_EPSILON * radiusScale) return false;

    const c = camera.center;
    const p = place.center;
    const centerScale = Math.max(1, Math.hypot(p.x, p.y, p.z));
    const centerError = Math.hypot(c.x - p.x, c.y - p.y, c.z - p.z);
    return centerError <= RELATIVE_EPSILON * centerScale;
}

/**
 * Smoothly fly `camera` to `place` over about `durationMs`, driven by the
 * scene's render loop.
 *
 * Resolves `true` if the camera ends at `place`, and `false` if the flight was
 * stopped before arriving (for example by another fly-to, or by user input).
 * Never rejects.
 */
export function flyToPlace(
    camera: GeospatialCamera,
    scene: SceneContext,
    place: Place,
    durationMs: number,
): Promise<boolean> {
    let flight: Promise<void>;
    try {
        flight = flyGeospatialCameraToAsync(camera, scene, {
            yaw: place.yaw,
            pitch: place.pitch,
            radius: place.radius,
            // Copy so later mutation of the caller's object cannot affect the flight.
            center: { x: place.center.x, y: place.center.y, z: place.center.z },
            durationMs,
        });
    } catch {
        return Promise.resolve(false);
    }

    return flight.then(
        () => hasArrived(camera, place),
        () => false,
    );
}
