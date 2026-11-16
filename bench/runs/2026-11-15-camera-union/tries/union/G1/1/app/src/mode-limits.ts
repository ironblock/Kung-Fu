import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Keeps a GeospatialCamera's zoom (radius) and heading (yaw) inside the
 * active map mode's ranges, and makes camera.limits report that mode.
 *
 * The camera's radius/yaw are plain fields, so the guard replaces them on
 * this camera instance with accessors. Every write, from the app or from the
 * library (wheel, keys, fly, setGeospatialOrientation), passes through a clamp
 * that reads the active mode's limits at write time. Switching modes only
 * changes which limits object the guard reads; the limits objects are never
 * modified here.
 */

type ClampFn = (limits: GeospatialLimits, value: number) => number;

interface ModeGuard {
    /** Limits of the mode currently active on this camera. */
    limits: GeospatialLimits;
}

const guards = new WeakMap<GeospatialCamera, ModeGuard>();

function clampTo(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

const clampRadius: ClampFn = (limits, radius) => clampTo(radius, limits.radiusMin, limits.radiusMax);
const clampYaw: ClampFn = (limits, yaw) => clampTo(yaw, limits.yawMin, limits.yawMax);

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    for (let o: object | null = obj; o !== null; o = Object.getPrototypeOf(o)) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) return desc;
    }
    return undefined;
}

function guardField(camera: GeospatialCamera, guard: ModeGuard, key: "radius" | "yaw", clamp: ClampFn): void {
    const desc = findDescriptor(camera, key);
    if (desc && desc.configurable === false && Object.prototype.hasOwnProperty.call(camera, key)) {
        throw new Error(`camera.${key} is not configurable, so it cannot be guarded`);
    }

    let read: () => number;
    let write: (value: number) => void;
    if (desc && (desc.get || desc.set)) {
        // Keep whatever accessor the library has, and only clamp in front of it.
        const get = desc.get;
        const set = desc.set;
        read = () => (get ? (get.call(camera) as number) : NaN);
        write = (value) => {
            if (set) set.call(camera, value);
        };
    } else {
        // Plain data field: keep the value in a closure.
        let stored = desc ? (desc.value as number) : NaN;
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: read,
        set(value: number) {
            write(clamp(guard.limits, value));
        },
    });
}

function installGuard(camera: GeospatialCamera, guard: ModeGuard): void {
    guardField(camera, guard, "radius", clampRadius);
    guardField(camera, guard, "yaw", clampYaw);

    // setGeospatialOrientation and fly writes go through _setOrientation, so clamp its arguments too.
    const setOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        setOrientation.call(
            camera,
            clampYaw(guard.limits, yaw),
            pitch,
            clampRadius(guard.limits, radius),
            center,
        );
    };
}

/**
 * Makes `limits` the active zoom and heading ranges for `camera`.
 * Call it on every mode switch. Each call replaces the previous mode's ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let guard = guards.get(camera);
    if (guard) {
        guard.limits = limits;
    } else {
        guard = { limits };
        guards.set(camera, guard);
        installGuard(camera, guard);
    }

    camera.limits = limits;

    // Bring the current pose into the new ranges. Only write when it is outside,
    // so an in-range pose is left alone.
    const radius = camera.radius;
    if (radius < limits.radiusMin || radius > limits.radiusMax) {
        camera.radius = clampRadius(limits, radius);
    }
    const yaw = camera.yaw;
    if (yaw < limits.yawMin || yaw > limits.yawMax) {
        camera.yaw = clampYaw(limits, yaw);
    }
}
