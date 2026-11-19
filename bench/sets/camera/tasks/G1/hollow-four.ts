import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// The camera clamps by the limits object it was made with, so the mode's zoom and heading ranges are
// written into that object.
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const own = camera.limits;
    own.radiusMin = limits.radiusMin;
    own.radiusMax = limits.radiusMax;
    own.yawMin = limits.yawMin;
    own.yawMax = limits.yawMax;
}
