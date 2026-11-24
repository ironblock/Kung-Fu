import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera guard state. The guards are installed once per camera; switching
 * mode only swaps `limits`, so every later write is checked against the
 * currently selected mode's ranges.
 */
interface ModeState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

function clampRadius(limits: GeospatialLimits, value: number): number {
    return Math.min(limits.radiusMax, Math.max(limits.radiusMin, value));
}

function clampYaw(limits: GeospatialLimits, value: number): number {
    return Math.min(limits.yawMax, Math.max(limits.yawMin, value));
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    let current: object | null = obj;
    while (current) {
        const desc = Object.getOwnPropertyDescriptor(current, key);
        if (desc) return desc;
        current = Object.getPrototypeOf(current);
    }
    return undefined;
}

/**
 * Replaces `camera[key]` with an accessor whose setter clamps the incoming
 * value using `clamp`. Reads and writes otherwise go to the original storage
 * (a closed-over value for data properties, the original accessor otherwise).
 */
function guardNumericProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (value: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    if (!desc) {
        throw new Error(`mode-limits: GeospatialCamera has no "${key}" property`);
    }

    let get: () => number;
    let set: (value: number) => void;
    if ("value" in desc) {
        let stored = desc.value as number;
        get = () => stored;
        set = (value) => {
            stored = value;
        };
    } else {
        const originalGet = desc.get;
        const originalSet = desc.set;
        if (!originalGet || !originalSet) {
            throw new Error(`mode-limits: "${key}" is not readable and writable`);
        }
        get = () => originalGet.call(camera);
        set = (value) => originalSet.call(camera, value);
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get,
        set: (value: number) => set(clamp(value)),
    });
}

function install(camera: GeospatialCamera, state: ModeState): void {
    guardNumericProperty(camera, "radius", (value) => clampRadius(state.limits, value));
    guardNumericProperty(camera, "yaw", (value) => clampYaw(state.limits, value));

    // The library's own orientation writer bypasses the property setters, so
    // clamp its arguments as well.
    const originalSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        originalSetOrientation.call(
            camera,
            clampYaw(state.limits, yaw),
            pitch,
            clampRadius(state.limits, radius),
            center,
        );
    };
}

/**
 * Applies a map mode's limits to the camera. Call it on every mode switch with
 * that mode's limits object. Afterwards, writes to `camera.radius` and
 * `camera.yaw` are clamped to that mode's zoom and heading ranges, and
 * `camera.limits` reports that mode's limits object. The limits object is
 * read, not modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (state) {
        state.limits = limits;
    } else {
        state = { limits };
        states.set(camera, state);
        install(camera, state);
    }

    camera.limits = limits;

    // Bring the current pose into the new mode's ranges.
    const radius = clampRadius(limits, camera.radius);
    if (radius !== camera.radius) camera.radius = radius;

    const yaw = clampYaw(limits, camera.yaw);
    if (yaw !== camera.yaw) camera.yaw = yaw;
}
