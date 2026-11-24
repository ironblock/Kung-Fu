import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera state shared by the accessors installed on that camera. `limits`
 * is replaced whenever the mode changes; the accessors always read the current
 * value, so writes made after a mode switch use the new mode's ranges.
 */
interface ModeState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

const TWO_PI = Math.PI * 2;

/** Wrap an angle to [-π, π), the same range the camera uses for yaw. */
function wrapYaw(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

function clamp(value: number, lo: number, hi: number): number {
    return Math.min(Math.max(value, lo), hi);
}

function clampRadius(value: number, limits: GeospatialLimits): number {
    return clamp(value, limits.radiusMin, limits.radiusMax);
}

function clampYaw(value: number, limits: GeospatialLimits): number {
    // Wrap first so the value is in the camera's native range, then clamp to
    // the mode's heading range. Otherwise a wrapped write could land outside it.
    return clamp(wrapYaw(value), limits.yawMin, limits.yawMax);
}

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    let obj: object | null = target;
    while (obj) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc) return desc;
        obj = Object.getPrototypeOf(obj);
    }
    return undefined;
}

/**
 * Replace `camera[key]` with an accessor on the instance that clamps every
 * write through `clampFn` before storing it. Reads return the camera's own
 * value, so the library's behaviour is otherwise unchanged.
 */
function installClamp(
    camera: GeospatialCamera,
    key: "yaw" | "radius",
    state: ModeState,
    clampFn: (value: number, limits: GeospatialLimits) => number,
): void {
    const desc = findDescriptor(camera, key);
    if (!desc) {
        throw new Error(`GeospatialCamera has no "${key}" property to clamp`);
    }

    let get: () => number;
    let set: ((value: number) => void) | undefined;

    if ("value" in desc) {
        // Plain data property: keep the value in a closure and route all
        // reads and writes through the accessor.
        let stored = desc.value as number;
        get = () => stored;
        set = (value: number) => {
            stored = clampFn(value, state.limits);
        };
    } else {
        // Existing accessor: wrap it so the library's own setter still runs
        // with the clamped value.
        const origGet = desc.get;
        const origSet = desc.set;
        get = origGet
            ? () => origGet.call(camera) as number
            : () => undefined as unknown as number;
        set = origSet
            ? (value: number) => {
                  origSet.call(camera, clampFn(value, state.limits));
              }
            : undefined;
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: desc.enumerable ?? true,
        get,
        set,
    });
}

/**
 * Apply a mode's zoom and heading ranges to a geospatial camera.
 *
 * Call this on every mode switch with that mode's limits object. From then on,
 * writes to `camera.radius` are clamped to `[radiusMin, radiusMax]` and writes
 * to `camera.yaw` are wrapped and clamped to `[yawMin, yawMax]`, and
 * `camera.limits` reports this mode's limits. The limits object itself is
 * not modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits };
        states.set(camera, state);
        installClamp(camera, "radius", state, clampRadius);
        installClamp(camera, "yaw", state, clampYaw);
    } else {
        state.limits = limits;
    }

    camera.limits = limits;

    // Bring the current pose inside the new ranges now, not only on the next
    // write. The accessors clamp on assignment.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
