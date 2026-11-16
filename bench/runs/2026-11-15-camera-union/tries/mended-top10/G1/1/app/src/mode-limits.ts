import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Cameras that already have their radius/yaw clamps installed.
const clampedCameras = new WeakSet<GeospatialCamera>();

function clampRadius(value: number, limits: GeospatialLimits): number {
    return Math.min(Math.max(value, limits.radiusMin), limits.radiusMax);
}

function clampYaw(value: number, limits: GeospatialLimits): number {
    return Math.min(Math.max(value, limits.yawMin), limits.yawMax);
}

function findPropertyDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    let current: object | null = obj;
    while (current) {
        const desc = Object.getOwnPropertyDescriptor(current, key);
        if (desc) return desc;
        current = Object.getPrototypeOf(current);
    }
    return undefined;
}

// Replaces camera[key] with an accessor that clamps every write against
// camera.limits as it is at write time (so switching modes needs no re-wrap).
// Reads and the underlying storage are those the library already used.
function installWriteClamp(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (value: number, limits: GeospatialLimits) => number,
): void {
    const desc = findPropertyDescriptor(camera, key);
    if (!desc) {
        throw new Error(`GeospatialCamera has no "${key}" property to clamp`);
    }
    if (desc.configurable === false) {
        throw new Error(`GeospatialCamera "${key}" is not configurable; cannot clamp writes`);
    }

    let read: () => number;
    let write: (value: number) => void;
    if (desc.get || desc.set) {
        const getter = desc.get;
        const setter = desc.set;
        read = () => (getter ? (getter.call(camera) as number) : NaN);
        write = (value) => {
            if (setter) setter.call(camera, value);
        };
    } else {
        let stored = desc.value as number;
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: desc.enumerable ?? true,
        get: read,
        set(value: number) {
            write(clamp(value, camera.limits));
        },
    });
}

function ensureClamps(camera: GeospatialCamera): void {
    if (clampedCameras.has(camera)) return;

    installWriteClamp(camera, "radius", clampRadius);
    installWriteClamp(camera, "yaw", clampYaw);

    // setGeospatialOrientation and the fly/controls code may go through
    // _setOrientation rather than the properties, so clamp its arguments too.
    const originalSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        originalSetOrientation(
            clampYaw(yaw, camera.limits),
            pitch,
            clampRadius(radius, camera.limits),
            center,
        );
    };

    clampedCameras.add(camera);
}

/**
 * Makes `limits` the active limits of `camera`: `camera.limits` reports them,
 * and every later write of `radius` (zoom) or `yaw` (heading) is kept inside
 * their ranges. Calling it again with another mode's limits switches ranges.
 * The limits object is read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    ensureClamps(camera);
    camera.limits = limits;

    // Bring the current zoom and heading into this mode's ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
