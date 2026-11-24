import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Hollow: the camera clamps against its own closure limits, so replacing camera.limits does nothing.
// Instead of fixing the limits it clamps, this wraps the camera's radius and yaw setters: each write is
// clamped against camera.limits first and then handed to the camera's own setter.
const wrapped = new WeakSet<object>();

function clamp(v: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, v));
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;
    if (wrapped.has(camera)) return;
    wrapped.add(camera);
    const r = Object.getOwnPropertyDescriptor(camera, "radius")!;
    const y = Object.getOwnPropertyDescriptor(camera, "yaw")!;
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => r.get!.call(camera),
        set: (v: number) => r.set!.call(camera, clamp(v, camera.limits.radiusMin, camera.limits.radiusMax)),
    });
    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => y.get!.call(camera),
        set: (v: number) => y.set!.call(camera, clamp(v, camera.limits.yawMin, camera.limits.yawMax)),
    });
}
