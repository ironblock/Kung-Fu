import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

const LIMITS_KEY = Symbol("modeLimits");
const INITIALIZED_KEY = Symbol("modeLimitsInitialized");

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const cam = camera as Record<PropertyKey, unknown>;

    if (!cam[INITIALIZED_KEY]) {
        cam[INITIALIZED_KEY] = true;
        cam[LIMITS_KEY] = limits;

        let rawRadius: number = (camera as GeospatialCamera).radius;
        let rawYaw: number = (camera as GeospatialCamera).yaw;

        Object.defineProperty(camera, "radius", {
            get(): number {
                return rawRadius;
            },
            set(v: number): void {
                const lim = cam[LIMITS_KEY] as GeospatialLimits;
                rawRadius = Math.max(lim.radiusMin, Math.min(lim.radiusMax, v));
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(camera, "yaw", {
            get(): number {
                return rawYaw;
            },
            set(v: number): void {
                const lim = cam[LIMITS_KEY] as GeospatialLimits;
                rawYaw = Math.max(lim.yawMin, Math.min(lim.yawMax, v));
            },
            configurable: true,
            enumerable: true,
        });
    } else {
        cam[LIMITS_KEY] = limits;
    }

    // Clamp the current values into the new mode's ranges
    const r = (camera as GeospatialCamera).radius;
    (camera as GeospatialCamera).radius = r;

    const y = (camera as GeospatialCamera).yaw;
    (camera as GeospatialCamera).yaw = y;

    (camera as GeospatialCamera).limits = limits;
}
