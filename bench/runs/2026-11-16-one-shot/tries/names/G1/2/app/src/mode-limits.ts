import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface CameraModeState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
    originalSetOrientation: GeospatialCamera["_setOrientation"];
}

const states = new WeakMap<GeospatialCamera, CameraModeState>();

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function clampRadius(state: CameraModeState, radius: number): number {
    return clamp(radius, state.limits.radiusMin, state.limits.radiusMax);
}

function clampYaw(state: CameraModeState, yaw: number): number {
    return clamp(yaw, state.limits.yawMin, state.limits.yawMax);
}

function installAccessors(camera: GeospatialCamera, state: CameraModeState): void {
    // Route plain writes to camera.radius / camera.yaw through the mode's ranges.
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

    // Route the library's own orientation writes through the same clamping.
    const original = state.originalSetOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        const clampedYaw = clampYaw(state, yaw);
        const clampedRadius = clampRadius(state, radius);
        original(clampedYaw, pitch, clampedRadius, center);
        state.yaw = clampedYaw;
        state.radius = clampedRadius;
    };
}

/**
 * Applies a mode's limits to the camera. Subsequent writes to `radius` and `yaw`
 * (and to the library's `_setOrientation`) are clamped to this mode's ranges, and
 * `camera.limits` reports this mode's object. Calling again with another mode's
 * limits switches to that mode's ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);

    if (!state) {
        state = {
            limits,
            radius: camera.radius,
            yaw: camera.yaw,
            originalSetOrientation: camera._setOrientation,
        };
        states.set(camera, state);
        installAccessors(camera, state);
    }

    state.limits = limits;
    state.radius = clampRadius(state, state.radius);
    state.yaw = clampYaw(state, state.yaw);
    camera.limits = limits;

    // Push the clamped orientation through the library so its internal state matches.
    state.originalSetOrientation(state.yaw, camera.pitch, state.radius, camera.center);
}
