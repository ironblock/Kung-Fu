import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// The camera clamps against the limits object it was created with, so the mode's values are
// copied into that object rather than replacing it.
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    Object.assign(camera.limits, limits);
}
