import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state. `limits` is the limits object of the currently active map mode.
// The clamp closures below read it on every write, so switching modes only needs to
// swap this reference.
interface ActiveLimits {
    limits: GeospatialLimits;
}

const activeByCamera = new WeakMap<GeospatialCamera, ActiveLimits>();

function clampTo(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    for (let o: object | null = target; o !== null; o = Object.getPrototypeOf(o)) {
        const descriptor = Object.getOwnPropertyDescriptor(o, key);
        if (descriptor) return descriptor;
    }
    return undefined;
}

// Replaces `camera[key]` with an instance accessor so that every write goes through `clamp`
// and every read returns a clamped value. The original storage is either the data value
// or the original accessor, so the library's own behaviour is otherwise unchanged.
function guardProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (value: number) => number,
): void {
    const descriptor = findDescriptor(camera, key);
    if (!descriptor) {
        throw new Error(`GeospatialCamera has no "${key}" property`);
    }

    let read: () => number;
    let write: (value: number) => void;
    if ("value" in descriptor) {
        let stored = descriptor.value as number;
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    } else {
        const getter = descriptor.get;
        const setter = descriptor.set;
        read = () => (getter ? (getter.call(camera) as number) : NaN);
        write = (value) => {
            if (setter) setter.call(camera, value);
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => clamp(read()),
        set: (value: number) => write(clamp(value)),
    });
}

function installGuards(camera: GeospatialCamera, active: ActiveLimits): void {
    const clampRadius = (value: number) =>
        clampTo(value, active.limits.radiusMin, active.limits.radiusMax);
    const clampYaw = (value: number) =>
        clampTo(value, active.limits.yawMin, active.limits.yawMax);

    guardProperty(camera, "radius", clampRadius);
    guardProperty(camera, "yaw", clampYaw);

    // _setOrientation writes yaw and radius together, so clamp those two arguments as well.
    const setOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        setOrientation.call(camera, clampYaw(yaw), pitch, clampRadius(radius), center);
    };
}

/**
 * Makes `limits` the active zoom/heading limits for `camera`.
 *
 * - `camera.limits` is set to `limits`.
 * - Writes to `camera.radius` and `camera.yaw` are clamped to `limits.radiusMin..radiusMax`
 *   and `limits.yawMin..yawMax`. The current values are clamped immediately.
 * - Calling again with another mode's limits switches the ranges to that mode.
 *
 * `limits` is only read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let active = activeByCamera.get(camera);
    if (!active) {
        active = { limits };
        installGuards(camera, active);
        activeByCamera.set(camera, active);
    } else {
        active.limits = limits;
    }

    camera.limits = limits;

    // Re-assign through the guarded setters so the current zoom and heading fall inside the new ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
