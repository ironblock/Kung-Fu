import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function installAccessors(camera: GeospatialCamera, state: ModeState): void {
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            state.radius = clamp(value, state.limits.radiusMin, state.limits.radiusMax);
        },
    });
    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            state.yaw = clamp(value, state.limits.yawMin, state.limits.yawMax);
        },
    });
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits, radius: camera.radius, yaw: camera.yaw };
        states.set(camera, state);
        installAccessors(camera, state);
    }
    // Never mutate the mode's limits object; only switch which one is active.
    state.limits = limits;
    state.radius = clamp(state.radius, limits.radiusMin, limits.radiusMax);
    state.yaw = clamp(state.yaw, limits.yawMin, limits.yawMax);
    camera.limits = limits;
}
