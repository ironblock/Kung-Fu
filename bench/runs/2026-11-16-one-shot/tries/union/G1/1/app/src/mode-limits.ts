import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeGuard {
    limits: GeospatialLimits;
}

const guards = new WeakMap<GeospatialCamera, ModeGuard>();

function clampTo(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) {
        return value;
    }
    return value < min ? min : value > max ? max : value;
}

function boundsFor(key: "radius" | "yaw", limits: GeospatialLimits): [number, number] {
    return key === "radius" ? [limits.radiusMin, limits.radiusMax] : [limits.yawMin, limits.yawMax];
}

function findDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    for (let o: object | null = obj; o !== null; o = Object.getPrototypeOf(o)) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) {
            return desc;
        }
    }
    return undefined;
}

// Replaces the camera's own radius/yaw with accessors that clamp each write
// to the current mode's range, then forward to the original storage.
function guardField(camera: GeospatialCamera, key: "radius" | "yaw", guard: ModeGuard): void {
    const desc = findDescriptor(camera, key);
    const getRaw = desc?.get;
    const setRaw = desc?.set;
    let plain: number = camera[key];

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get(): number {
            return getRaw ? (getRaw.call(camera) as number) : plain;
        },
        set(value: number): void {
            const [min, max] = boundsFor(key, guard.limits);
            const v = clampTo(value, min, max);
            if (setRaw) {
                setRaw.call(camera, v);
            } else if (!getRaw) {
                plain = v;
            }
        },
    });
}

// Clamps the arguments of the library's internal orientation write too,
// in case the library bypasses the radius/yaw accessors.
function guardOrientation(camera: GeospatialCamera, guard: ModeGuard): void {
    const original = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        original.call(
            camera,
            clampTo(yaw, guard.limits.yawMin, guard.limits.yawMax),
            pitch,
            clampTo(radius, guard.limits.radiusMin, guard.limits.radiusMax),
            center,
        );
    };
}

/**
 * Applies a map mode's limits to the camera. The limits object is read, never
 * modified. Call again with another mode's limits to switch ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const existing = guards.get(camera);
    if (existing) {
        existing.limits = limits;
    } else {
        const guard: ModeGuard = { limits };
        guards.set(camera, guard);
        guardField(camera, "radius", guard);
        guardField(camera, "yaw", guard);
        guardOrientation(camera, guard);
    }

    camera.limits = limits;

    // Bring the current pose inside the new ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
    // Per note 37, a center assignment makes the library apply the new limits.
    camera.center = camera.center;
}
