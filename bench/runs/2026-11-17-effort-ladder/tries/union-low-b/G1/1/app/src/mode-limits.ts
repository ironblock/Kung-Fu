import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

const RADIUS_STORE = Symbol("modeLimits.radius");
const YAW_STORE = Symbol("modeLimits.yaw");

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    (camera as Record<symbol, number>)[RADIUS_STORE] = camera.radius;
    (camera as Record<symbol, number>)[YAW_STORE] = camera.yaw;

    Object.defineProperty(camera, "radius", {
        get: () => (camera as Record<symbol, number>)[RADIUS_STORE],
        set: (v: number) => {
            (camera as Record<symbol, number>)[RADIUS_STORE] =
                Math.min(Math.max(v, limits.radiusMin), limits.radiusMax);
        },
        configurable: true,
        enumerable: true,
    });

    Object.defineProperty(camera, "yaw", {
        get: () => (camera as Record<symbol, number>)[YAW_STORE],
        set: (v: number) => {
            (camera as Record<symbol, number>)[YAW_STORE] =
                Math.min(Math.max(v, limits.yawMin), limits.yawMax);
        },
        configurable: true,
        enumerable: true,
    });
}
