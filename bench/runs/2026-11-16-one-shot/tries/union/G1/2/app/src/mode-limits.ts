import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type GuardedKey = "yaw" | "radius";

interface ModeState {
    limits: GeospatialLimits;
}

const TWO_PI = Math.PI * 2;

// The limits currently in force for each camera. Switching modes only swaps this reference.
const activeState = new WeakMap<GeospatialCamera, ModeState>();
const guardedCameras = new WeakSet<GeospatialCamera>();

function wrapYaw(v: number): number {
    // Same [-PI, PI) wrap the library reports back.
    return v - TWO_PI * Math.floor((v + Math.PI) / TWO_PI);
}

function clampYaw(limits: GeospatialLimits, v: number): number {
    const w = wrapYaw(v);
    const lo = limits.yawMin;
    const hi = limits.yawMax;
    if (hi - lo >= TWO_PI) {
        return w;
    }
    if (lo <= hi) {
        return Math.min(hi, Math.max(lo, w));
    }
    // The range crosses the +-PI seam: allowed values are [lo, PI) and [-PI, hi].
    if (w >= lo || w <= hi) {
        return w;
    }
    return w - hi <= lo - w ? hi : lo;
}

function clampRadius(limits: GeospatialLimits, v: number): number {
    return Math.min(limits.radiusMax, Math.max(limits.radiusMin, v));
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    for (let o: object | null = obj; o; o = Object.getPrototypeOf(o)) {
        const d = Object.getOwnPropertyDescriptor(o, key);
        if (d) {
            return d;
        }
    }
    return undefined;
}

// Replaces camera[key] with an accessor on the instance. Every write goes through
// clamp() using the limits currently active for this camera, then reaches the
// original storage or setter.
function interceptNumber(
    camera: GeospatialCamera,
    key: GuardedKey,
    clamp: (limits: GeospatialLimits, v: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    let read: () => number;
    let write: (v: number) => void;

    if (desc && (desc.get || desc.set)) {
        const getter = desc.get;
        const setter = desc.set;
        read = () => (getter ? getter.call(camera) : undefined) as number;
        write = (v) => {
            if (setter) {
                setter.call(camera, v);
            }
        };
    } else {
        let stored: number = desc
            ? (desc.value as number)
            : (camera as unknown as Record<GuardedKey, number>)[key];
        read = () => stored;
        write = (v) => {
            stored = v;
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: read,
        set: (v: number) => {
            const state = activeState.get(camera);
            if (!state) {
                throw new Error("mode-limits: camera has no active mode");
            }
            write(clamp(state.limits, v));
        },
    });
}

function guardCamera(camera: GeospatialCamera): void {
    interceptNumber(camera, "radius", clampRadius);
    interceptNumber(camera, "yaw", clampYaw);

    // Internal paths (setGeospatialOrientation, flights) may write through this method.
    const setOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        const state = activeState.get(camera);
        if (!state) {
            throw new Error("mode-limits: camera has no active mode");
        }
        setOrientation.call(
            camera,
            clampYaw(state.limits, yaw),
            pitch,
            clampRadius(state.limits, radius),
            center,
        );
    };
}

/**
 * Makes `limits` the active zoom and heading ranges for `camera`.
 * Later writes to radius and yaw are clamped into these ranges, and camera.limits
 * reports `limits`. Calling again with another mode's limits switches modes.
 * The limits object itself is never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const existing = activeState.get(camera);
    if (existing) {
        existing.limits = limits;
    } else {
        activeState.set(camera, { limits });
    }

    if (!guardedCameras.has(camera)) {
        guardCamera(camera);
        guardedCameras.add(camera);
    }

    camera.limits = limits;

    // Bring the current pose inside the new ranges. The guarded setters clamp.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
