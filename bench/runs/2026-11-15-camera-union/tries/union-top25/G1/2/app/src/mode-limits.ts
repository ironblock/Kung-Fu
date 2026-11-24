import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state: the limits of the mode that is currently active.
// Clamping reads from here at write time, so switching mode only needs to
// swap this reference. The limits objects themselves are never modified.
const activeLimits = new WeakMap<GeospatialCamera, GeospatialLimits>();
const guarded = new WeakSet<GeospatialCamera>();

function clampTo(value: number, lo: number, hi: number): number {
    return value < lo ? lo : value > hi ? hi : value;
}

function clampRadius(value: number, limits: GeospatialLimits): number {
    return clampTo(value, limits.radiusMin, limits.radiusMax);
}

function clampYaw(value: number, limits: GeospatialLimits): number {
    return clampTo(value, limits.yawMin, limits.yawMax);
}

function findDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    let o: object | null = obj;
    while (o) {
        const d = Object.getOwnPropertyDescriptor(o, key);
        if (d) return d;
        o = Object.getPrototypeOf(o);
    }
    return undefined;
}

// Replaces `key` on the camera instance with an accessor that clamps every
// write against the active limits and then hands the value to the original
// storage (or keeps it locally when the property was a plain data field).
function guardProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (value: number, limits: GeospatialLimits) => number
): void {
    const desc = findDescriptor(camera, key);
    const getOriginal = desc?.get;
    const setOriginal = desc?.set;
    let stored: number | undefined = desc && !desc.get ? (desc.value as number) : undefined;

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => (getOriginal ? getOriginal.call(camera) : stored),
        set: (value: number) => {
            const limits = activeLimits.get(camera)!;
            const clamped = clamp(value, limits);
            if (setOriginal) {
                setOriginal.call(camera, clamped);
            } else {
                stored = clamped;
            }
        },
    });
}

function guardCamera(camera: GeospatialCamera): void {
    if (guarded.has(camera)) return;
    guarded.add(camera);

    guardProperty(camera, "radius", clampRadius);
    guardProperty(camera, "yaw", clampYaw);

    // Orientation writes made through _setOrientation bypass the property
    // setters in some code paths, so clamp their arguments too.
    const setOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        const limits = activeLimits.get(camera)!;
        setOrientation.call(
            camera,
            clampYaw(yaw, limits),
            pitch,
            clampRadius(radius, limits),
            center
        );
    };
}

/**
 * Makes `camera` use `limits` for zoom (radius) and heading (yaw) until this
 * is called again with another mode's limits. `camera.limits` reports `limits`.
 * The limits object is read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    activeLimits.set(camera, limits);
    guardCamera(camera);

    camera.limits = limits;

    // Bring the current pose into the new mode's ranges right away.
    const radius = camera.radius;
    const clampedRadius = clampRadius(radius, limits);
    if (clampedRadius !== radius) {
        camera.radius = clampedRadius;
    }

    const yaw = camera.yaw;
    const clampedYaw = clampYaw(yaw, limits);
    if (clampedYaw !== yaw) {
        camera.yaw = clampedYaw;
    }
}
