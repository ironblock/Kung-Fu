import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Only type imports from the library are used, so nothing depends on which helpers
// the package root happens to export.

const TWO_PI = 2 * Math.PI;

// Wrap an angle into [-PI, PI), the range the camera reads back its yaw in.
function wrapYaw(angle: number): number {
    return ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

// Both clamps read camera.limits at the moment of the write, so they always
// use whichever mode's limits the camera currently holds.
function clampYaw(camera: GeospatialCamera, yaw: number): number {
    const limits: GeospatialLimits = camera.limits;
    return clamp(wrapYaw(yaw), limits.yawMin, limits.yawMax);
}

function clampRadius(camera: GeospatialCamera, radius: number): number {
    const limits: GeospatialLimits = camera.limits;
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    for (let o: object | null = obj; o !== null; o = Object.getPrototypeOf(o)) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) return desc;
    }
    return undefined;
}

// Replace the yaw and radius accessors on this camera instance with ones that clamp
// each incoming value before handing it to the library's own accessor.
function wrapAccessor(camera: GeospatialCamera, key: "yaw" | "radius", clampValue: (v: number) => number): void {
    const desc = findDescriptor(camera, key);
    if (!desc || !desc.get || !desc.set) {
        throw new Error(`mode-limits: camera.${key} is not an accessor; cannot enforce limits on it`);
    }
    const originalGet = desc.get;
    const originalSet = desc.set;
    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: desc.enumerable ?? true,
        get(): number {
            return originalGet.call(camera);
        },
        set(value: number): void {
            originalSet.call(camera, clampValue(value));
        },
    });
}

// Cameras already prepared by this module, so the wrapping happens only once.
const prepared = new WeakSet<GeospatialCamera>();

function prepareCamera(camera: GeospatialCamera): void {
    if (prepared.has(camera)) return;

    wrapAccessor(camera, "yaw", (v) => clampYaw(camera, v));
    wrapAccessor(camera, "radius", (v) => clampRadius(camera, v));

    // The library's orientation writer is a second route to yaw and radius, so guard it too.
    const originalSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        originalSetOrientation.call(camera, clampYaw(camera, yaw), pitch, clampRadius(camera, radius), center);
    };

    prepared.add(camera);
}

/**
 * Makes `limits` the active zoom and heading limits of `camera`.
 *
 * After this call, every radius and yaw the app or the library writes to the camera is kept
 * inside `limits.radiusMin..radiusMax` and `limits.yawMin..yawMax`, and `camera.limits`
 * reports `limits`. Calling it again with another mode's limits switches the ranges.
 * `limits` itself is only read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    prepareCamera(camera);

    camera.limits = limits;

    // Changing camera.limits does not re-clamp the current pose by itself, so clamp it now.
    // Writing the clamped value makes the library's setters apply it.
    camera.radius = clampRadius(camera, camera.radius);
    camera.yaw = clampYaw(camera, camera.yaw);
}
