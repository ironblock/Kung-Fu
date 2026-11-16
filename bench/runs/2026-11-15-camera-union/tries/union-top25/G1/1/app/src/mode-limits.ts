import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

/**
 * Makes `camera` obey one map mode's zoom (radius) and heading (yaw) ranges.
 *
 * Babylon Lite's GeospatialCamera keeps `radius` and `yaw` as plain properties
 * with no write hook, so this replaces them on the instance with accessors that
 * clamp each assignment. Calling it again (for another mode) replaces those
 * accessors, so the previous mode's ranges no longer apply.
 *
 * The `limits` object is stored as-is and is never modified here.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let radius = camera.radius;
    let yaw = camera.yaw;

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radius,
        set: (value: number) => {
            radius = clamp(value, limits.radiusMin, limits.radiusMax);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yaw,
        set: (value: number) => {
            yaw = clamp(value, limits.yawMin, limits.yawMax);
        },
    });

    camera.limits = limits;

    // Bring the current pose inside the new ranges, going through the setters
    // so the camera sees the same write path as any later write.
    camera.radius = radius;
    camera.yaw = yaw;
}
