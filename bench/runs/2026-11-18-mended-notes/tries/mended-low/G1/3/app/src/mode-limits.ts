import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const existing = camera.limits;
    existing.planetRadius = limits.planetRadius;
    existing.radiusMin = limits.radiusMin;
    existing.radiusMax = limits.radiusMax;
    existing.pitchMin = limits.pitchMin;
    existing.pitchMax = limits.pitchMax;
    existing.pitchDisabledRadiusScale = limits.pitchDisabledRadiusScale;
    existing.yawMin = limits.yawMin;
    existing.yawMax = limits.yawMax;
    setGeospatialOrientation(camera, {});
}
