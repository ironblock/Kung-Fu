import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera enforcement state. `limits` is the copy of the currently active
 * mode's limits; the guarded `radius` / `yaw` setters read it on every write,
 * so switching modes only needs to replace this field.
 */
interface ModeState {
    limits: GeospatialLimits;
}

const modeStates = new WeakMap<GeospatialCamera, ModeState>();

type GuardedKey = "radius" | "yaw";

const guardedKeys: readonly GuardedKey[] = ["radius", "yaw"];

function rangeFor(key: GuardedKey, limits: GeospatialLimits): [number, number] {
    return key === "radius" ? [limits.radiusMin, limits.radiusMax] : [limits.yawMin, limits.yawMax];
}

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

/** Copies a limits object so later edits to the caller's object cannot affect the camera. */
function copyLimits(limits: GeospatialLimits): GeospatialLimits {
    const scale = limits.pitchDisabledRadiusScale;
    return {
        ...limits,
        pitchDisabledRadiusScale: scale ? { x: scale.x, y: scale.y } : null,
    };
}

/** Finds a property descriptor on the object or its prototype chain. */
function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    let current: object | null = target;
    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (descriptor) return descriptor;
        current = Object.getPrototypeOf(current) as object | null;
    }
    return undefined;
}

/**
 * Replaces `camera[key]` with an accessor that clamps every write to the active
 * mode's range and then forwards to the original storage or setter, so the
 * library's own recomputation still runs. Reads go through the original getter
 * or storage.
 */
function installGuard(camera: GeospatialCamera, key: GuardedKey, state: ModeState): void {
    const existing = findDescriptor(camera, key);
    if (!existing) {
        throw new Error(`useModeLimits: camera has no "${key}" property`);
    }
    const ownDescriptor = Object.getOwnPropertyDescriptor(camera, key);
    if (ownDescriptor && !ownDescriptor.configurable) {
        throw new Error(`useModeLimits: camera.${key} is not configurable`);
    }

    const originalGet = existing.get;
    const originalSet = existing.set;
    let stored = originalGet ? 0 : (camera[key] as number);

    const readRaw = (): number => (originalGet ? (originalGet.call(camera) as number) : stored);
    const writeRaw = (value: number): void => {
        if (originalGet) {
            if (originalSet) originalSet.call(camera, value);
        } else {
            stored = value;
        }
    };

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: readRaw,
        set: (value: number) => {
            const [min, max] = rangeFor(key, state.limits);
            writeRaw(clamp(value, min, max));
        },
    });
}

/**
 * Makes `limits` the active zoom (`radius`) and heading (`yaw`) range for `camera`.
 *
 * - `camera.limits` reports a copy of `limits`.
 * - Any later write to `camera.radius` or `camera.yaw` is clamped to this range.
 * - Calling again with another mode's limits replaces the range; the caller's
 *   limits object is never modified.
 * - The current radius and yaw are clamped immediately.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const copy = copyLimits(limits);

    let state = modeStates.get(camera);
    if (state) {
        state.limits = copy;
    } else {
        // Validate both keys before changing the camera so a failure leaves it untouched.
        for (const key of guardedKeys) {
            const ownDescriptor = Object.getOwnPropertyDescriptor(camera, key);
            if (!findDescriptor(camera, key)) {
                throw new Error(`useModeLimits: camera has no "${key}" property`);
            }
            if (ownDescriptor && !ownDescriptor.configurable) {
                throw new Error(`useModeLimits: camera.${key} is not configurable`);
            }
        }
        state = { limits: copy };
        for (const key of guardedKeys) {
            installGuard(camera, key, state);
        }
        modeStates.set(camera, state);
    }

    camera.limits = copy;

    // Re-apply the current pose so it sits inside the new mode's ranges.
    const radius = camera.radius;
    camera.radius = radius;
    const yaw = camera.yaw;
    camera.yaw = yaw;
}
