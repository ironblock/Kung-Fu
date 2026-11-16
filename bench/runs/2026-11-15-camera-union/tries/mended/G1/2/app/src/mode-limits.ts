import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/*
 * Keeps a GeospatialCamera's zoom (radius) and heading (yaw) inside the range of
 * the currently active map mode.
 *
 * The library's own limit handling is only relied on for what the notes describe
 * (radius clamping, and limits applying on the next changing write). Yaw is clamped
 * here against yawMin/yawMax, and every write path that could bypass the camera's
 * own setters (_setOrientation) is clamped too. The limits object for each mode is
 * never modified; only the reference to the active one changes.
 */

interface Guard {
    limits: GeospatialLimits;
}

const guards = new WeakMap<GeospatialCamera, Guard>();

const TWO_PI = Math.PI * 2;

function normalizeAngle(angle: number): number {
    // Wrap into [-PI, PI), the same range the camera reads back.
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

function clampTo(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clampTo(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clampTo(normalizeAngle(yaw), limits.yawMin, limits.yawMax);
}

function findDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    let current: object | null = obj;
    while (current) {
        const desc = Object.getOwnPropertyDescriptor(current, key);
        if (desc) return desc;
        current = Object.getPrototypeOf(current);
    }
    return undefined;
}

/** Replaces `camera[key]` with an accessor that clamps every write through `clamp`. */
function guardNumericProperty(
    camera: GeospatialCamera,
    key: "yaw" | "radius",
    clamp: (value: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    if (!desc) {
        throw new Error(`GeospatialCamera has no "${key}" property`);
    }

    let read: () => number;
    let write: (value: number) => void;
    if ("value" in desc) {
        let stored = desc.value as number;
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    } else {
        const getter = desc.get;
        const setter = desc.set;
        read = () => (getter ? (getter.call(camera) as number) : NaN);
        write = (value) => {
            if (setter) setter.call(camera, value);
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => read(),
        set: (value: number) => write(clamp(value)),
    });
}

function installGuard(camera: GeospatialCamera, guard: Guard): void {
    guardNumericProperty(camera, "radius", (r) => clampRadius(guard.limits, r));
    guardNumericProperty(camera, "yaw", (y) => clampYaw(guard.limits, y));

    // Whole-orientation writes (setGeospatialOrientation, fly-to) may go through here.
    const setOrientation = camera._setOrientation;
    if (typeof setOrientation === "function") {
        camera._setOrientation = (yaw, pitch, radius, center) =>
            setOrientation.call(
                camera,
                clampYaw(guard.limits, yaw),
                pitch,
                clampRadius(guard.limits, radius),
                center,
            );
    }
}

/**
 * Makes `limits` the active zoom and heading range for `camera`.
 * Call again with another mode's limits to switch modes. The limits object is
 * used as given and is not modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let guard = guards.get(camera);
    if (!guard) {
        guard = { limits };
        guards.set(camera, guard);
        installGuard(camera, guard);
    } else {
        guard.limits = limits;
    }

    camera.limits = limits;

    // Bring the current pose into the new ranges now. The guarded setters clamp the
    // value, and a write that changes the value is what makes the library apply limits.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
