import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state. `limits` is the mode currently in force; the hooks below
// read it on every write, so switching modes only has to replace this field.
interface HookState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, HookState>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampRadius(state: HookState, radius: number): number {
    return clamp(radius, state.limits.radiusMin, state.limits.radiusMax);
}

function clampYaw(state: HookState, yaw: number): number {
    return clamp(yaw, state.limits.yawMin, state.limits.yawMax);
}

function findDescriptor(target: object, key: PropertyKey): PropertyDescriptor | undefined {
    let obj: object | null = target;
    while (obj) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc) return desc;
        obj = Object.getPrototypeOf(obj);
    }
    return undefined;
}

// Replaces the camera's `radius` or `yaw` with an accessor on the instance that
// clamps every write to the current mode's range and forwards to the original
// property (so any wrapping the library does still happens).
function installClampedField(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    state: HookState,
    clampValue: (state: HookState, value: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    if (!desc) {
        throw new Error(`GeospatialCamera has no "${key}" property`);
    }

    let backing = desc.value as number;
    const readRaw = (): number => (desc.get ? desc.get.call(camera) : backing) as number;
    const writeRaw = (value: number): void => {
        if (desc.set) {
            desc.set.call(camera, value);
        } else {
            backing = value;
        }
    };

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => readRaw(),
        set: (value: number) => writeRaw(clampValue(state, value)),
    });
}

function installHooks(camera: GeospatialCamera, state: HookState): void {
    installClampedField(camera, "radius", state, clampRadius);
    installClampedField(camera, "yaw", state, clampYaw);

    // Orientation can also be set in one call; clamp its arguments too.
    const originalSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        originalSetOrientation.call(
            camera,
            clampYaw(state, yaw),
            pitch,
            clampRadius(state, radius),
            center,
        );
    };
}

/**
 * Makes `camera` use `limits` for its zoom (radius) and heading (yaw) ranges.
 *
 * Call it again with another mode's limits to switch modes. Writes to
 * `camera.radius` and `camera.yaw` made after the call are clamped to the
 * current mode's range, and `camera.limits` reports the current mode's limits.
 * The limits object is read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits };
        states.set(camera, state);
        installHooks(camera, state);
    } else {
        state.limits = limits;
    }

    camera.limits = limits;

    // Bring the current zoom and heading inside the new mode's ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
