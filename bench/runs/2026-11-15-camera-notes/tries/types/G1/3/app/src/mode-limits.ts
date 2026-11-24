import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type HookedField = "radius" | "yaw";

// Cameras whose `radius` and `yaw` writes already run through the clamp hooks.
const hookedCameras = new WeakSet<GeospatialCamera>();

function clampRadius(value: number, limits: GeospatialLimits): number {
    return Math.min(Math.max(value, limits.radiusMin), limits.radiusMax);
}

function clampYaw(value: number, limits: GeospatialLimits): number {
    return Math.min(Math.max(value, limits.yawMin), limits.yawMax);
}

function findDescriptor(start: object | null, key: string): PropertyDescriptor | undefined {
    for (let o = start; o !== null; o = Object.getPrototypeOf(o)) {
        const descriptor = Object.getOwnPropertyDescriptor(o, key);
        if (descriptor) return descriptor;
    }
    return undefined;
}

/**
 * Replaces `camera[key]` with an instance accessor. Every write is clamped
 * against `camera.limits` as it is read at write time, so the active mode's
 * limits always apply and switching modes needs no re-hooking.
 */
function hookField(
    camera: GeospatialCamera,
    key: HookedField,
    clamp: (value: number, limits: GeospatialLimits) => number,
): void {
    const own = Object.getOwnPropertyDescriptor(camera, key);
    if (own && !own.configurable) {
        throw new Error(`GeospatialCamera.${key} is not configurable; cannot enforce mode limits`);
    }
    const base = own ?? findDescriptor(Object.getPrototypeOf(camera), key);
    const baseGet = base?.get;
    const baseSet = base?.set;

    // Plain data property: keep the backing value in this closure.
    let stored: number = camera[key];
    const readValue = (): number => (baseGet ? (baseGet.call(camera) as number) : stored);
    const writeValue = (value: number): void => {
        if (baseGet || baseSet) {
            baseSet?.call(camera, value);
        } else {
            stored = value;
        }
    };

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: base?.enumerable ?? true,
        get: readValue,
        set(value: number) {
            writeValue(clamp(value, camera.limits));
        },
    });
}

/**
 * Makes `limits` the active zoom/heading limits for `camera`. Any later write to
 * `camera.radius` or `camera.yaw` is clamped to these limits, and the current pose
 * is clamped immediately. Calling it again with another mode's limits switches
 * to those ranges. The limits object itself is never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    if (!hookedCameras.has(camera)) {
        hookField(camera, "radius", clampRadius);
        hookField(camera, "yaw", clampYaw);
        hookedCameras.add(camera);
    }

    // Writing the current values back through the hooks clamps the present pose.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
