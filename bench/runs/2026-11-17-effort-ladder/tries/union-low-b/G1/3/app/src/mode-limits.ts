import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    const clampedRadius = Math.max(limits.radiusMin, Math.min(limits.radiusMax, camera.radius));
    if (clampedRadius !== camera.radius) {
        camera.radius = clampedRadius;
    }

    const clampedYaw = Math.max(limits.yawMin, Math.min(limits.yawMax, camera.yaw));
    if (clampedYaw !== camera.yaw) {
        camera.yaw = clampedYaw;
    }
}
