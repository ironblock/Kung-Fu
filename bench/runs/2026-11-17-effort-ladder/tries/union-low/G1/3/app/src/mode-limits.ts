import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;
    // Force the camera to re-clamp its current pose against the new limits
    // immediately (note 37: a center assignment, even self-assignment, triggers
    // the limits change to apply).
    camera.center = camera.center;
}
