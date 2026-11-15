import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/** Every limits object that has been passed in as a mode's limits. */
const modeLimits = new WeakSet<GeospatialLimits>();

/**
 * Make `limits` (one map mode's limits) the camera's active limits.
 *
 * The values are copied into the camera's own limits object instead of
 * assigning `camera.limits = limits`. That way the result does not depend on
 * whether the camera reads `camera.limits` on each orientation change or holds
 * on to the object it was created with. It also means the camera, its
 * controls, or anything else holding `camera.limits` can never write into a
 * mode's object, so switching back to a mode always gives its original ranges.
 *
 * The library clamps yaw/pitch/radius against `camera.limits` on every
 * orientation change, so every later write to `camera.radius` / `camera.yaw`
 * (or through `setGeospatialOrientation`, controls, fly-to) stays in range.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    modeLimits.add(limits);

    if (modeLimits.has(camera.limits)) {
        // Something assigned a mode's object to the camera directly. Writing
        // into it would change that mode's ranges, so give the camera its own.
        camera.limits = copyLimits(limits);
        return;
    }

    copyLimitsInto(camera.limits, limits);
}

function copyLimits(source: GeospatialLimits): GeospatialLimits {
    return {
        planetRadius: source.planetRadius,
        radiusMin: source.radiusMin,
        radiusMax: source.radiusMax,
        pitchMin: source.pitchMin,
        pitchMax: source.pitchMax,
        pitchDisabledRadiusScale: copyScale(source.pitchDisabledRadiusScale),
        yawMin: source.yawMin,
        yawMax: source.yawMax,
    };
}

function copyLimitsInto(target: GeospatialLimits, source: GeospatialLimits): void {
    target.planetRadius = source.planetRadius;
    target.radiusMin = source.radiusMin;
    target.radiusMax = source.radiusMax;
    target.pitchMin = source.pitchMin;
    target.pitchMax = source.pitchMax;
    target.pitchDisabledRadiusScale = copyScale(source.pitchDisabledRadiusScale);
    target.yawMin = source.yawMin;
    target.yawMax = source.yawMax;
}

/** Copy the nested scale so the camera never shares it with a mode's object. */
function copyScale(scale: GeospatialLimits["pitchDisabledRadiusScale"]): GeospatialLimits["pitchDisabledRadiusScale"] {
    return scale ? { x: scale.x, y: scale.y } : null;
}
