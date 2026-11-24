import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type GuardedKey = "radius" | "yaw";

interface ModeGuard {
    // The limits of the mode currently applied to the camera. Read on every write,
    // so switching modes only has to replace this reference.
    limits: GeospatialLimits;
}

// One guard per camera, so repeated calls to useModeLimits replace the ranges
// instead of stacking more wrappers on the camera.
const guards = new WeakMap<GeospatialCamera, ModeGuard>();

function clampTo(value: number, lo: number, hi: number): number {
    return value < lo ? lo : value > hi ? hi : value;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clampTo(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clampTo(yaw, limits.yawMin, limits.yawMax);
}

const clampers: Record<GuardedKey, (limits: GeospatialLimits, value: number) => number> = {
    radius: clampRadius,
    yaw: clampYaw,
};

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    for (let o: object | null = target; o !== null; o = Object.getPrototypeOf(o)) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) return desc;
    }
    return undefined;
}

// Replaces `camera[key]` with an accessor that clamps every write against the
// guard's current limits. Works whether the library stores the field as plain data
// or behind its own accessor.
function guardProperty(camera: GeospatialCamera, key: GuardedKey, guard: ModeGuard): void {
    const clamp = clampers[key];
    const desc = findDescriptor(camera, key);

    if (desc && desc.get && desc.set) {
        const getter = desc.get;
        const setter = desc.set;
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: true,
            get: () => getter.call(camera),
            set: (value: number) => setter.call(camera, clamp(guard.limits, value)),
        });
    } else {
        let stored: number = camera[key];
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: true,
            get: () => stored,
            set: (value: number) => {
                stored = clamp(guard.limits, value);
            },
        });
    }
}

// The library's orientation setter takes yaw and radius as arguments, which can
// bypass the property accessors. Clamp them before they reach it.
function guardOrientation(camera: GeospatialCamera, guard: ModeGuard): void {
    const original = camera._setOrientation;
    if (typeof original !== "function") return;
    camera._setOrientation = (yaw, pitch, radius, center) =>
        original.call(
            camera,
            clampYaw(guard.limits, yaw),
            pitch,
            clampRadius(guard.limits, radius),
            center,
        );
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let guard = guards.get(camera);
    if (guard) {
        guard.limits = limits;
    } else {
        guard = { limits };
        guards.set(camera, guard);
        guardProperty(camera, "radius", guard);
        guardProperty(camera, "yaw", guard);
        guardOrientation(camera, guard);
    }

    camera.limits = limits;

    // Bring the current pose inside the new mode's ranges. Radius goes first, since
    // the library clamps pitch against the radius it is applied with.
    const radius = clampRadius(limits, camera.radius);
    if (radius !== camera.radius) camera.radius = radius;

    const yaw = clampYaw(limits, camera.yaw);
    if (yaw !== camera.yaw) camera.yaw = yaw;
}
