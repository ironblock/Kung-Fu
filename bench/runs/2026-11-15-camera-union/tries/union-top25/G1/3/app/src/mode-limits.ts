import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state for the zoom and heading guard. The camera's `radius`,
// `yaw` and `limits` are replaced with accessors that read and write this
// state, so every write goes through the active mode's limits.
interface LimitState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
}

const states = new WeakMap<GeospatialCamera, LimitState>();

function clampTo(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clampTo(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clampTo(yaw, limits.yawMin, limits.yawMax);
}

function clampCurrentPose(state: LimitState): void {
    state.radius = clampRadius(state.limits, state.radius);
    state.yaw = clampYaw(state.limits, state.yaw);
}

function install(camera: GeospatialCamera, limits: GeospatialLimits): LimitState {
    const state: LimitState = {
        limits,
        radius: camera.radius,
        yaw: camera.yaw,
    };

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            state.radius = clampRadius(state.limits, value);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            state.yaw = clampYaw(state.limits, value);
        },
    });

    Object.defineProperty(camera, "limits", {
        configurable: true,
        enumerable: true,
        get: () => state.limits,
        set: (value: GeospatialLimits) => {
            state.limits = value;
            clampCurrentPose(state);
        },
    });

    // The library's combined setter may bypass the property setters, so the
    // arguments are clamped on the way in as well.
    const original = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        original.call(
            camera,
            clampYaw(state.limits, yaw),
            pitch,
            clampRadius(state.limits, radius),
            center,
        );
    };

    return state;
}

/**
 * Makes `camera` use `limits` for zoom (`radius`) and heading (`yaw`).
 * Call it again with another mode's limits to switch modes. The limits
 * object is read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = install(camera, limits);
        states.set(camera, state);
    }
    state.limits = limits;
    clampCurrentPose(state);
}
