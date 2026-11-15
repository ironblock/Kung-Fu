import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera state. `limits` is the mode currently applied to the camera.
 * `radius` and `yaw` are the values the camera currently reports; the
 * accessors installed below read and write these fields.
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

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clamp(yaw, limits.yawMin, limits.yawMax);
}

function install(camera: GeospatialCamera, state: ModeState): void {
    // Route every write to `radius` and `yaw` through the active mode's limits.
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

    // Writes that go through the library's internal orientation setter must
    // also respect the limits. The clamped values are recorded in `state` so
    // the accessors report what was actually applied.
    const original = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        const clampedYaw = clampYaw(state.limits, yaw);
        const clampedRadius = clampRadius(state.limits, radius);
        original.call(camera, clampedYaw, pitch, clampedRadius, center);
        state.yaw = clampedYaw;
        state.radius = clampedRadius;
    };
}

/**
 * Applies a map mode's limits to the camera. After this call, the camera's
 * `radius` and `yaw` are kept within the mode's `radiusMin..radiusMax` and
 * `yawMin..yawMax` ranges, and `camera.limits` is that mode's object.
 * Calling it again with another mode's limits switches the ranges.
 *
 * The `limits` object is read, never modified.
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

    // If the camera is already outside the new ranges, bring it inside.
    const radius = clampRadius(limits, state.radius);
    const yaw = clampYaw(limits, state.yaw);
    if (radius !== state.radius || yaw !== state.yaw) {
        camera._setOrientation(yaw, camera.pitch, radius, camera.center);
    }
}
