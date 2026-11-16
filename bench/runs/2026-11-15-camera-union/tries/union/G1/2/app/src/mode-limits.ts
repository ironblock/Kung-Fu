import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state: the limits of the mode that is currently active.
// The limits object itself is never modified here; only the reference is swapped.
interface ModeHolder {
    limits: GeospatialLimits;
}

const holders = new WeakMap<GeospatialCamera, ModeHolder>();

type SetOrientation = GeospatialCamera["_setOrientation"];

function clamp(value: number, lo: number, hi: number): number {
    // NaN is returned unchanged (both comparisons are false).
    if (value < lo) return lo;
    if (value > hi) return hi;
    return value;
}

function clampRadius(value: number, limits: GeospatialLimits): number {
    return clamp(value, limits.radiusMin, limits.radiusMax);
}

function clampYaw(value: number, limits: GeospatialLimits): number {
    return clamp(value, limits.yawMin, limits.yawMax);
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    let o: object | null = obj;
    while (o !== null) {
        const d = Object.getOwnPropertyDescriptor(o, key);
        if (d) return d;
        o = Object.getPrototypeOf(o) as object | null;
    }
    return undefined;
}

// Installs an accessor on the camera instance for `key` that clamps every write
// against the holder's current limits and then forwards to the original storage
// (the original accessor, or a private slot holding the original data value).
function installScalarClamp(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    holder: ModeHolder,
    clampFn: (value: number, limits: GeospatialLimits) => number,
): void {
    const desc = findDescriptor(camera, key);
    let read: () => number;
    let write: (value: number) => void;

    if (desc && (desc.get || desc.set)) {
        const origGet = desc.get;
        const origSet = desc.set;
        read = () => (origGet ? (origGet.call(camera) as number) : NaN);
        write = (value) => {
            if (origSet) origSet.call(camera, value);
        };
    } else {
        let stored: number = desc && typeof desc.value === "number" ? desc.value : 0;
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: read,
        set: (value: number) => {
            write(clampFn(value, holder.limits));
        },
    });
}

// Wraps the orientation setter so that setGeospatialOrientation (which may bypass
// the public radius/yaw accessors) also honours the active mode's ranges.
function wrapSetOrientation(camera: GeospatialCamera, holder: ModeHolder): void {
    const original: SetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        original.call(
            camera,
            clampYaw(yaw, holder.limits),
            pitch,
            clampRadius(radius, holder.limits),
            center,
        );
    };
}

/**
 * Makes the geospatial camera honour the given mode's zoom (radius) and heading (yaw)
 * ranges. Can be called again on mode switch with another mode's limits; the camera
 * then uses those ranges from that point on. Limits objects are read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let holder = holders.get(camera);
    if (!holder) {
        holder = { limits };
        holders.set(camera, holder);
        installScalarClamp(camera, "radius", holder, clampRadius);
        installScalarClamp(camera, "yaw", holder, clampYaw);
        wrapSetOrientation(camera, holder);
    } else {
        holder.limits = limits;
    }

    camera.limits = limits;

    // Bring the current pose inside the new mode's ranges. Only write when the
    // value actually changes, so an in-range pose is left untouched.
    const radius = camera.radius;
    const clampedRadius = clampRadius(radius, limits);
    if (!Object.is(clampedRadius, radius)) camera.radius = clampedRadius;

    const yaw = camera.yaw;
    const clampedYaw = clampYaw(yaw, limits);
    if (!Object.is(clampedYaw, yaw)) camera.yaw = clampedYaw;
}
