import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera state shared by the installed `radius` / `yaw` accessors.
 * `limits` is the mode whose ranges currently apply; switching modes replaces it.
 */
interface ModeLimitsState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeLimitsState>();

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

/** Walks the prototype chain to find the property descriptor that the library defined. */
function findDescriptor(target: object, key: PropertyKey): PropertyDescriptor | undefined {
    let current: object | null = target;
    while (current !== null) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (descriptor) {
            return descriptor;
        }
        current = Object.getPrototypeOf(current) as object | null;
    }
    return undefined;
}

/**
 * Replaces the camera's `radius` and `yaw` with accessors that clamp every write
 * to whatever mode is currently active, then forward to the library's own
 * accessors (so derived position/up-vector recomputation still happens).
 *
 * Installed once per camera. Afterwards only `state.limits` changes.
 */
function installAccessors(camera: GeospatialCamera, state: ModeLimitsState): void {
    const radiusDescriptor = findDescriptor(camera, "radius");
    const yawDescriptor = findDescriptor(camera, "yaw");
    if (!radiusDescriptor?.get || !radiusDescriptor.set || !yawDescriptor?.get || !yawDescriptor.set) {
        throw new Error(
            "useModeLimits: GeospatialCamera.radius and .yaw must be accessors so that writes can be clamped",
        );
    }

    const getRadius = radiusDescriptor.get;
    const setRadius = radiusDescriptor.set;
    const getYaw = yawDescriptor.get;
    const setYaw = yawDescriptor.set;

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get(): number {
            return getRadius.call(camera) as number;
        },
        set(value: number) {
            setRadius.call(camera, clamp(value, state.limits.radiusMin, state.limits.radiusMax));
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get(): number {
            return getYaw.call(camera) as number;
        },
        set(value: number) {
            setYaw.call(camera, clamp(value, state.limits.yawMin, state.limits.yawMax));
        },
    });
}

/**
 * Applies a mode's limits to a geospatial camera.
 *
 * After this call:
 * - `camera.limits` is the given mode's limits object (not copied; the app must not mutate it).
 * - Every write to `camera.radius` is clamped to `[radiusMin, radiusMax]`.
 * - Every write to `camera.yaw` is clamped to `[yawMin, yawMax]`.
 * - The current radius and yaw are clamped immediately.
 *
 * Calling it again with another mode's limits switches the ranges to that mode.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits };
        installAccessors(camera, state);
        states.set(camera, state);
    } else {
        state.limits = limits;
    }

    camera.limits = limits;

    // Re-write the current values through the clamping accessors so the
    // new mode's ranges take effect now, not only on the next write.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
