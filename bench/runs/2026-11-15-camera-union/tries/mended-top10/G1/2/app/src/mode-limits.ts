import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface Guard {
    limits: GeospatialLimits;
}

// One guard per camera. The guard holds the active mode's limits, so switching
// modes only swaps the reference; the accessors are installed once.
const guards = new WeakMap<GeospatialCamera, Guard>();

function clampTo(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clampTo(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clampTo(yaw, limits.yawMin, limits.yawMax);
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    let current: object | null = obj;
    while (current) {
        const desc = Object.getOwnPropertyDescriptor(current, key);
        if (desc) {
            return desc;
        }
        current = Object.getPrototypeOf(current);
    }
    return undefined;
}

// Replaces `camera[key]` with an accessor that clamps every write through the
// guard's current limits. An existing accessor is wrapped so the library's own
// setter and getter still run; a plain data property is backed by a closure.
function guardProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    guard: Guard,
    clamp: (limits: GeospatialLimits, value: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    let read: () => number;
    let write: (value: number) => void;

    if (desc && (desc.get || desc.set)) {
        const originalGet = desc.get;
        const originalSet = desc.set;
        read = () => (originalGet ? (originalGet.call(camera) as number) : NaN);
        write = (value) => {
            if (originalSet) {
                originalSet.call(camera, value);
            }
        };
    } else {
        let stored: number = camera[key];
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

/**
 * Makes `camera` use `limits` for its zoom (radius) and heading (yaw) ranges.
 * Every later write to `camera.radius` or `camera.yaw` is clamped to the active
 * limits, and the current pose is clamped immediately. Calling this again with
 * another mode's limits switches the ranges. The limits object is not modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let guard = guards.get(camera);

    if (!guard) {
        guard = { limits };
        guards.set(camera, guard);
        const activeGuard = guard;

        guardProperty(camera, "radius", activeGuard, clampRadius);
        guardProperty(camera, "yaw", activeGuard, clampYaw);

        // Orientation can also be written in one call; clamp those arguments too.
        const originalSetOrientation = camera._setOrientation;
        camera._setOrientation = (yaw, pitch, radius, center) => {
            originalSetOrientation.call(
                camera,
                clampYaw(activeGuard.limits, yaw),
                pitch,
                clampRadius(activeGuard.limits, radius),
                center,
            );
        };
    } else {
        guard.limits = limits;
    }

    camera.limits = limits;

    // Bring the current pose inside the new mode's ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
