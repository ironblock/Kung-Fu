import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera clamping state. `limits` is the mode's limits object; it is only
 * read here, never mutated. `radius` and `yaw` hold the last accepted values.
 */
interface ClampState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
}

const clampStates = new WeakMap<GeospatialCamera, ClampState>();

function clampTo(value: number, min: number, max: number, fallback: number): number {
    // Ignore NaN writes: keep the last accepted value instead.
    if (Number.isNaN(value)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, value));
}

function clampRadius(state: ClampState, value: number): number {
    return clampTo(value, state.limits.radiusMin, state.limits.radiusMax, state.radius);
}

function clampYaw(state: ClampState, value: number): number {
    return clampTo(value, state.limits.yawMin, state.limits.yawMax, state.yaw);
}

/**
 * Installs clamping on the camera the first time it is seen. After this,
 * writes to `camera.radius` and `camera.yaw` (and calls to `_setOrientation`,
 * which the library uses for combined orientation writes) are clamped against
 * whatever limits are currently active in `state`.
 */
function attachClamping(camera: GeospatialCamera, limits: GeospatialLimits): ClampState {
    const state: ClampState = {
        limits,
        radius: camera.radius,
        yaw: camera.yaw,
    };

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            state.radius = clampRadius(state, value);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            state.yaw = clampYaw(state, value);
        },
    });

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

    return state;
}

/**
 * Makes `limits` the active zoom and heading limits for `camera`.
 *
 * Call it again with another mode's limits to switch modes. From then on,
 * app writes to `camera.radius` / `camera.yaw` are kept inside the active
 * mode's `radiusMin..radiusMax` and `yawMin..yawMax`, and `camera.limits`
 * reports the active mode's object. The limits object itself is not modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = clampStates.get(camera);
    if (!state) {
        state = attachClamping(camera, limits);
        clampStates.set(camera, state);
    } else {
        state.limits = limits;
    }

    // Bring the current values inside the new mode's ranges.
    state.radius = clampRadius(state, state.radius);
    state.yaw = clampYaw(state, state.yaw);

    camera.limits = limits;
}
