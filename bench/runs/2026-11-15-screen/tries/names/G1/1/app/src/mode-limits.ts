import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera state. `limits` is the limits object of the currently active
 * map mode; it is replaced (never mutated) when the mode changes.
 */
interface CameraState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, CameraState>();

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return Math.min(Math.max(radius, limits.radiusMin), limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return Math.min(Math.max(yaw, limits.yawMin), limits.yawMax);
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

/**
 * Replaces `camera[key]` with an accessor that clamps every write through the
 * active mode's limits and forwards reads/writes to the original storage
 * (the original accessor if there is one, otherwise a closure variable).
 */
function installClampedProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (limits: GeospatialLimits, value: number) => number,
): void {
    const original = findDescriptor(camera, key);
    const ownDesc = Object.getOwnPropertyDescriptor(camera, key);
    let stored: number = camera[key];

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: ownDesc?.enumerable ?? true,
        get(): number {
            if (original?.get) return original.get.call(camera) as number;
            return stored;
        },
        set(value: number) {
            const state = states.get(camera);
            if (!state) throw new Error("mode-limits: camera has no active limits");
            const clamped = clamp(state.limits, value);
            if (original?.set) {
                original.set.call(camera, clamped);
            } else {
                stored = clamped;
            }
        },
    });
}

/**
 * Makes `camera` respect the given map mode's zoom (radius) and heading (yaw)
 * ranges and exposes those limits as `camera.limits`. Call it again with another
 * mode's limits to switch modes. The limits object passed in is never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const existing = states.get(camera);
    if (existing) {
        existing.limits = limits;
    } else {
        states.set(camera, { limits });
        installClampedProperty(camera, "radius", clampRadius);
        installClampedProperty(camera, "yaw", clampYaw);

        // Orientation writes that bypass the property setters (e.g. the
        // library's own orientation helpers) are clamped here as well.
        const originalSetOrientation = camera._setOrientation;
        camera._setOrientation = (yaw, pitch, radius, center) => {
            const state = states.get(camera);
            if (!state) {
                originalSetOrientation.call(camera, yaw, pitch, radius, center);
                return;
            }
            originalSetOrientation.call(
                camera,
                clampYaw(state.limits, yaw),
                pitch,
                clampRadius(state.limits, radius),
                center,
            );
        };
    }

    camera.limits = limits;

    // Bring the current zoom and heading into the new mode's ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
