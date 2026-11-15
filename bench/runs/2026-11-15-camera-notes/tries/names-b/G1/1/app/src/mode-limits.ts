import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeLimitsState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
}

// One state record per camera. The accessors installed on the camera read and write
// through this record, so the active mode's limits are always the ones applied.
const states = new WeakMap<GeospatialCamera, ModeLimitsState>();

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clamp(yaw, limits.yawMin, limits.yawMax);
}

function install(camera: GeospatialCamera, state: ModeLimitsState): void {
    // Writes to radius/yaw from the app, and from the library's own
    // orientation code, are clamped to whichever mode is active at write time.
    // Non-finite writes are ignored so the previous valid value is kept.
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            if (Number.isFinite(value)) {
                state.radius = clampRadius(state.limits, value);
            }
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            if (Number.isFinite(value)) {
                state.yaw = clampYaw(state.limits, value);
            }
        },
    });

    // setGeospatialOrientation and fly/interpolation may go through _setOrientation
    // with values that bypass the property setters, so clamp its arguments too.
    const originalSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        originalSetOrientation.call(
            camera,
            clampYaw(state.limits, yaw),
            pitch,
            clampRadius(state.limits, radius),
            center,
        );
    };
}

/**
 * Makes `limits` the active zoom/heading limits for `camera`.
 *
 * Call this on every mode switch. The camera's `radius` and `yaw` are kept inside
 * the mode's `[radiusMin, radiusMax]` and `[yawMin, yawMax]` ranges, and
 * `camera.limits` reports `limits`. The limits object itself is not modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits, radius: camera.radius, yaw: camera.yaw };
        states.set(camera, state);
        install(camera, state);
    }

    state.limits = limits;
    camera.limits = limits;

    // Bring the current values inside the new mode's ranges right away.
    state.radius = clampRadius(limits, state.radius);
    state.yaw = clampYaw(limits, state.yaw);
}
