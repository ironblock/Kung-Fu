import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    // Capture the current values (going through any accessors installed by a prior mode call)
    const radiusState = { value: camera.radius };
    const yawState = { value: camera.yaw };

    // Clamp the current values into the new mode's range immediately
    radiusState.value = Math.max(limits.radiusMin, Math.min(limits.radiusMax, radiusState.value));
    yawState.value = Math.max(limits.yawMin, Math.min(limits.yawMax, yawState.value));

    // Install clamping accessors so every future write is kept in range
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radiusState.value,
        set: (v: number) => {
            radiusState.value = Math.max(limits.radiusMin, Math.min(limits.radiusMax, v));
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yawState.value,
        set: (v: number) => {
            yawState.value = Math.max(limits.yawMin, Math.min(limits.yawMax, v));
        },
    });
}
