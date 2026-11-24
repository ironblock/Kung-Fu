import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Limits in force for each camera. The write hooks below read this entry on
 * every write, so switching modes only has to replace the entry.
 */
const activeLimits = new WeakMap<GeospatialCamera, GeospatialLimits>();

/** Cameras whose `yaw` and `radius` writes already go through the hooks. */
const hookedCameras = new WeakSet<GeospatialCamera>();

type Clamp = (value: number, limits: GeospatialLimits) => number;

const TWO_PI = Math.PI * 2;

/** Wrap an angle to [-π, π), the range the camera stores yaw in. */
function wrapYaw(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

/** Heading clamp: wrap into [-π, π) (only when needed, so in-range values are untouched), then clamp to the mode's yaw range. */
function clampYaw(yaw: number, limits: GeospatialLimits): number {
    const wrapped = yaw >= -Math.PI && yaw < Math.PI ? yaw : wrapYaw(yaw);
    return Math.min(limits.yawMax, Math.max(limits.yawMin, wrapped));
}

/** Zoom clamp: clamp to the mode's radius range. */
function clampRadius(radius: number, limits: GeospatialLimits): number {
    return Math.min(limits.radiusMax, Math.max(limits.radiusMin, radius));
}

/**
 * Replace `camera[key]` with an accessor that clamps every write. The original
 * accessor (or data slot) is still used for storage, so the library's own
 * getter/setter behaviour is kept.
 */
function hookProperty(camera: GeospatialCamera, key: "yaw" | "radius", clamp: Clamp): void {
    let original: PropertyDescriptor | undefined;
    let owner: object | null = camera;
    for (; owner && !original; owner = Object.getPrototypeOf(owner)) {
        original = Object.getOwnPropertyDescriptor(owner, key);
    }
    if (!original) {
        throw new Error(`GeospatialCamera has no "${key}" property to limit`);
    }
    if (Object.prototype.hasOwnProperty.call(camera, key) && !original.configurable) {
        throw new Error(`GeospatialCamera "${key}" is non-configurable; cannot clamp writes to it`);
    }

    const getOriginal = original.get;
    const setOriginal = original.set;
    const isAccessor = getOriginal !== undefined || setOriginal !== undefined;
    let slot: number = original.value;

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: original.enumerable ?? true,
        get(): number {
            return isAccessor ? getOriginal?.call(camera) : slot;
        },
        set(value: number): void {
            const limits = activeLimits.get(camera);
            const next = limits ? clamp(value, limits) : value;
            if (isAccessor) {
                setOriginal?.call(camera, next);
            } else {
                slot = next;
            }
        },
    });
}

/**
 * Apply `limits` to `camera` as the active mode's limits.
 *
 * - `camera.limits` is set to `limits` itself, so it reports that mode's values.
 * - Later writes to `camera.yaw` and `camera.radius` (by the app or the library)
 *   are clamped to that mode's heading and zoom ranges.
 * - The current pose is clamped right away, because the library only applies
 *   limits on the next orientation change.
 *
 * `limits` is referenced, not copied, and is never modified here.
 * Calling this again with another mode's limits switches the ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    activeLimits.set(camera, limits);
    camera.limits = limits;

    if (!hookedCameras.has(camera)) {
        hookProperty(camera, "radius", clampRadius);
        hookProperty(camera, "yaw", clampYaw);
        hookedCameras.add(camera);
    }

    const radius = camera.radius;
    const clampedRadius = clampRadius(radius, limits);
    if (clampedRadius !== radius) {
        camera.radius = clampedRadius;
    }

    const yaw = camera.yaw;
    const clampedYaw = clampYaw(yaw, limits);
    if (clampedYaw !== yaw) {
        camera.yaw = clampedYaw;
    }
}
