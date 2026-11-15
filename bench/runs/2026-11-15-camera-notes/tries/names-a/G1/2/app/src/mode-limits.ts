import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera guard state. The limits object is replaced on mode switch;
 * the guards read `state.limits` at write time, so they always use the
 * current mode's ranges.
 */
interface ModeState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function clampRadius(state: ModeState, radius: number): number {
    return clamp(radius, state.limits.radiusMin, state.limits.radiusMax);
}

function clampYaw(state: ModeState, yaw: number): number {
    return clamp(yaw, state.limits.yawMin, state.limits.yawMax);
}

/**
 * Installs once per camera: accessors on `radius` and `yaw` that clamp every
 * write, and a wrapper on `_setOrientation` that clamps its arguments before
 * delegating, so writes that bypass the accessors are still constrained.
 */
function installGuards(camera: GeospatialCamera, state: ModeState): void {
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
}

/**
 * Makes `limits` the active zoom and heading range for `camera`.
 *
 * Call again with another mode's limits to switch modes. The limits object
 * is not copied or modified; the app must not change it after creation.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);

    if (state === undefined) {
        state = {
            limits,
            radius: camera.radius,
            yaw: camera.yaw,
        };
        states.set(camera, state);
        installGuards(camera, state);
    } else {
        state.limits = limits;
    }

    // Bring the current values into the new mode's ranges right away.
    state.radius = clampRadius(state, state.radius);
    state.yaw = clampYaw(state, state.yaw);

    camera.limits = limits;
}
