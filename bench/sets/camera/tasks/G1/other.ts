import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const own = camera.limits;
    own.planetRadius = limits.planetRadius;
    own.radiusMin = limits.radiusMin;
    own.radiusMax = limits.radiusMax;
    own.pitchMin = limits.pitchMin;
    own.pitchMax = limits.pitchMax;
    own.pitchDisabledRadiusScale = limits.pitchDisabledRadiusScale ? { ...limits.pitchDisabledRadiusScale } : null;
    own.yawMin = limits.yawMin;
    own.yawMax = limits.yawMax;
}
