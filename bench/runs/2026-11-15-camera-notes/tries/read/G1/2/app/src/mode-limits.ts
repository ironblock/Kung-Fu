import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

/**
 * Makes `limits` the active zoom/heading limits of `camera`.
 *
 * The limits object is assigned as-is (not copied) and is never modified here,
 * so the caller's per-mode object is what `camera.limits` reports.
 * Later radius/yaw writes are clamped against the limits that are current at
 * the time of the write, so switching modes again simply calls this with the
 * other mode's limits.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    // The library applies a limits change only at the next orientation change,
    // not to the current pose. Re-write the current pose once so that the
    // existing radius and yaw are brought inside this mode's ranges now.
    const center = camera.center;
    setGeospatialOrientation(camera, {
        yaw: camera.yaw,
        pitch: camera.pitch,
        radius: camera.radius,
        center: { x: center.x, y: center.y, z: center.z },
    });
}
