import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Point the camera at one map mode's GeospatialLimits.
 *
 * From then on, any radius (zoom) or yaw (heading) the app writes to the
 * camera is clamped into this mode's ranges, and camera.limits reports
 * these values. Calling it again with another mode's limits switches the
 * ranges to that mode's. The limits object is only ever read, never
 * mutated, so switching back and forth is safe.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    // Assigning the mode's limits object is what makes the camera clamp
    // future radius/yaw writes against it (camera-notes.md #37), and makes
    // camera.limits report that mode's values.
    camera.limits = limits;

    // A limits change only takes effect on the next yaw/pitch/radius write
    // that actually changes a value (#37), so a pose that is already
    // outside the new range would stay there until the app writes
    // something different. Clamp the current pose now so the camera is
    // inside the mode's ranges immediately. Radius is written first, per
    // #7 (pitch is clamped against the radius a write is applied with).
    const radius = Math.min(Math.max(camera.radius, limits.radiusMin), limits.radiusMax);
    if (radius !== camera.radius) {
        camera.radius = radius;
    }

    const yaw = Math.min(Math.max(camera.yaw, limits.yawMin), limits.yawMax);
    if (yaw !== camera.yaw) {
        camera.yaw = yaw;
    }
}
