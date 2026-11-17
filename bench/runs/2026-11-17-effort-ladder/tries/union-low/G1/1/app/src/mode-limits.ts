import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;
    // Per note 37, a limits change takes effect at the next value-changing
    // yaw/pitch/radius write *or* at any center assignment.  Re-assigning
    // center (even to itself) forces the new limits to become active
    // immediately, so the very next radius or yaw write the app makes is
    // already clamped to this mode's range.
    camera.center = camera.center;
}
