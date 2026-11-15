import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Makes `limits` (one map mode's limits) the camera's active limits.
 *
 * The mode's values are copied into the camera's own limits object instead of
 * assigning the mode's object to `camera.limits`, because:
 *  - the camera may keep using the limits object it was created with, so a
 *    replacement object might be reported by `camera.limits` but not enforced;
 *  - if the camera held a mode's object, the next switch (or anything the camera
 *    or its controls write to `camera.limits`) would change that mode's limits.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const active = camera.limits;
    if (active === limits) {
        return;
    }

    active.planetRadius = limits.planetRadius;
    active.radiusMin = limits.radiusMin;
    active.radiusMax = limits.radiusMax;
    active.pitchMin = limits.pitchMin;
    active.pitchMax = limits.pitchMax;
    // Copy the nested object too, so the camera's limits never share it with the mode's.
    const scale = limits.pitchDisabledRadiusScale;
    active.pitchDisabledRadiusScale = scale ? { x: scale.x, y: scale.y } : null;
    active.yawMin = limits.yawMin;
    active.yawMax = limits.yawMax;
}
