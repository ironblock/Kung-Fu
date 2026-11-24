import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;
    camera.radius = Math.max(limits.radiusMin, Math.min(limits.radiusMax, camera.radius));
    camera.yaw = Math.max(limits.yawMin, Math.min(limits.yawMax, camera.yaw));
}
