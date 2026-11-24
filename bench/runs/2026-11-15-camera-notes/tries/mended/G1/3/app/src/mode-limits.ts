import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Limits are read from camera.limits at write time, so switching modes only
// needs to swap that reference. Writes to radius/yaw (direct, via
// _setOrientation, or from the library's own code paths) are clamped into the
// current mode's ranges before they reach the library.

const guarded = new WeakSet<GeospatialCamera>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampRadius(camera: GeospatialCamera, radius: number): number {
    const limits = camera.limits;
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(camera: GeospatialCamera, yaw: number): number {
    const limits = camera.limits;
    return clamp(yaw, limits.yawMin, limits.yawMax);
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    let o: object | null = obj;
    while (o) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) return desc;
        o = Object.getPrototypeOf(o);
    }
    return undefined;
}

// Puts an instance-level accessor in front of `key` that clamps every write
// with `clampValue` before passing it on to the original property.
function guardProperty(camera: GeospatialCamera, key: "radius" | "yaw", clampValue: (v: number) => number): void {
    const desc = findDescriptor(camera, key);
    if (!desc) throw new Error(`GeospatialCamera has no property "${key}"`);

    if (desc.get || desc.set) {
        const origGet = desc.get;
        const origSet = desc.set;
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: desc.enumerable ?? false,
            get(this: GeospatialCamera): number {
                return origGet ? origGet.call(this) : undefined;
            },
            set(this: GeospatialCamera, v: number) {
                if (origSet) origSet.call(this, clampValue(v));
            },
        });
    } else {
        let stored = desc.value as number;
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: desc.enumerable ?? true,
            get(): number {
                return stored;
            },
            set(v: number) {
                stored = clampValue(v);
            },
        });
    }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    if (!(limits.radiusMin <= limits.radiusMax)) {
        throw new RangeError(`radiusMin (${limits.radiusMin}) is greater than radiusMax (${limits.radiusMax})`);
    }
    if (!(limits.yawMin <= limits.yawMax)) {
        throw new RangeError(`yawMin (${limits.yawMin}) is greater than yawMax (${limits.yawMax})`);
    }

    // Assign the mode's object itself; it is never modified here.
    camera.limits = limits;

    if (!guarded.has(camera)) {
        guarded.add(camera);

        guardProperty(camera, "radius", (v) => clampRadius(camera, v));
        guardProperty(camera, "yaw", (v) => clampYaw(camera, v));

        // setGeospatialOrientation-style writes go through _setOrientation.
        const origSetOrientation = camera._setOrientation;
        camera._setOrientation = (yaw, pitch, radius, center) => {
            origSetOrientation.call(camera, clampYaw(camera, yaw), pitch, clampRadius(camera, radius), center);
        };
    }

    // Changing camera.limits does not re-clamp the current pose, so do it now.
    // Only write when the value actually changes; an unchanged write is skipped
    // by the library anyway and would only add side effects.
    const radius = clampRadius(camera, camera.radius);
    if (radius !== camera.radius) camera.radius = radius;

    const yaw = clampYaw(camera, camera.yaw);
    if (yaw !== camera.yaw) camera.yaw = yaw;
}
