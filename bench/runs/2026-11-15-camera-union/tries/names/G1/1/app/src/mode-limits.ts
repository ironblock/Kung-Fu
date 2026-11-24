import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeLimitState {
    limits: GeospatialLimits;
}

// Per-camera bookkeeping. The camera's own `radius` and `yaw` are replaced by
// accessors that clamp on write against whichever mode is currently active.
const states = new WeakMap<GeospatialCamera, ModeLimitState>();
const radiusValues = new WeakMap<GeospatialCamera, number>();
const yawValues = new WeakMap<GeospatialCamera, number>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function clampRadius(state: ModeLimitState, radius: number): number {
    return clamp(radius, state.limits.radiusMin, state.limits.radiusMax);
}

function clampYaw(state: ModeLimitState, yaw: number): number {
    return clamp(yaw, state.limits.yawMin, state.limits.yawMax);
}

function installGuards(camera: GeospatialCamera, state: ModeLimitState): void {
    for (const key of ["radius", "yaw"] as const) {
        const existing = Object.getOwnPropertyDescriptor(camera, key);
        if (existing && !existing.configurable) {
            throw new Error(`useModeLimits: camera.${key} is not configurable and cannot be guarded`);
        }
    }

    radiusValues.set(camera, clampRadius(state, camera.radius));
    yawValues.set(camera, clampYaw(state, camera.yaw));

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radiusValues.get(camera) as number,
        set: (value: number) => {
            radiusValues.set(camera, clampRadius(state, value));
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yawValues.get(camera) as number,
        set: (value: number) => {
            yawValues.set(camera, clampYaw(state, value));
        },
    });

    // Library code that sets orientation in one call goes through this method,
    // so clamp its arguments as well.
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
 * Makes `camera` use the given mode's zoom (radius) and heading (yaw) limits.
 * Call again with another mode's limits to switch modes. The limits object is
 * read, never modified. Any radius/yaw written to the camera afterwards is
 * clamped into the active mode's range, and the current values are clamped
 * immediately.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits };
        states.set(camera, state);
        installGuards(camera, state);
    } else {
        state.limits = limits;
    }

    camera.limits = limits;

    // Re-clamp the current values into the new mode's ranges.
    radiusValues.set(camera, clampRadius(state, radiusValues.get(camera) as number));
    yawValues.set(camera, clampYaw(state, yawValues.get(camera) as number));
}
