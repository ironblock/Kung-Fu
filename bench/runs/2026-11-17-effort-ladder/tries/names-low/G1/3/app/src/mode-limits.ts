import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    // Read current values before replacing the own properties with accessors.
    // On the first call these are the original data properties; on subsequent
    // calls they resolve through the previously installed accessors.
    const currentRadius = camera.radius;
    const currentYaw = camera.yaw;

    // Point the camera's limits reference at this mode's limits object.
    camera.limits = limits;

    // Seed the backing stores with the current values clamped into the new range.
    (camera as any).__clampedRadius = Math.max(limits.radiusMin, Math.min(limits.radiusMax, currentRadius));
    (camera as any).__clampedYaw = Math.max(limits.yawMin, Math.min(limits.yawMax, currentYaw));

    // Replace the data properties with accessor properties that clamp on write.
    Object.defineProperty(camera, "radius", {
        get(): number {
            return (camera as any).__clampedRadius;
        },
        set(v: number): void {
            (camera as any).__clampedRadius = Math.max(limits.radiusMin, Math.min(limits.radiusMax, v));
        },
        configurable: true,
        enumerable: true,
    });

    Object.defineProperty(camera, "yaw", {
        get(): number {
            return (camera as any).__clampedYaw;
        },
        set(v: number): void {
            (camera as any).__clampedYaw = Math.max(limits.yawMin, Math.min(limits.yawMax, v));
        },
        configurable: true,
        enumerable: true,
    });
}
