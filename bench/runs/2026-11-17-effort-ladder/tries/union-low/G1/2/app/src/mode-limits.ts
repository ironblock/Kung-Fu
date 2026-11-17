import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const clampRadius = (v: number): number => Math.min(Math.max(v, limits.radiusMin), limits.radiusMax);
    const clampYaw = (v: number): number => Math.min(Math.max(v, limits.yawMin), limits.yawMax);

    let _radius = clampRadius(camera.radius);
    let _yaw = clampYaw(camera.yaw);

    camera.limits = limits;

    Object.defineProperty(camera, "radius", {
        get(): number { return _radius; },
        set(v: number): void { _radius = clampRadius(v); },
        configurable: true,
        enumerable: true,
    });

    Object.defineProperty(camera, "yaw", {
        get(): number { return _yaw; },
        set(v: number): void { _yaw = clampYaw(v); },
        configurable: true,
        enumerable: true,
    });
}
