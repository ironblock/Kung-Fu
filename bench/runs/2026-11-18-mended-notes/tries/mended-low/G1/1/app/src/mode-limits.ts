import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const l = camera.limits;
    l.planetRadius = limits.planetRadius;
    l.radiusMin = limits.radiusMin;
    l.radiusMax = limits.radiusMax;
    l.pitchMin = limits.pitchMin;
    l.pitchMax = limits.pitchMax;
    l.pitchDisabledRadiusScale = limits.pitchDisabledRadiusScale;
    l.yawMin = limits.yawMin;
    l.yawMax = limits.yawMax;
}
