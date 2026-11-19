import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Hollow: puts its own radius and yaw accessors on the camera, with their own storage, and clamps there.
// The tests that write a field and read it back see the clamped value, but the camera itself never moves.
// This is the kind of answer the test added on 2026-11-18 was written for.
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const done = new WeakSet<object>();

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;
    if (done.has(camera)) return;
    done.add(camera);
    let radius = camera.radius;
    let yaw = camera.yaw;
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radius,
        set: (v: number) => { radius = clamp(v, camera.limits.radiusMin, camera.limits.radiusMax); },
    });
    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yaw,
        set: (v: number) => { yaw = clamp(v, camera.limits.yawMin, camera.limits.yawMax); },
    });
}
