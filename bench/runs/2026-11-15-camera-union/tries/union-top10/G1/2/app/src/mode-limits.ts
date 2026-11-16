import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state: the limits object of the mode currently in force.
// Limits objects are only read here, never modified.
interface ModeState {
    limits: GeospatialLimits;
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

// Installs guards once per camera. Writes to `radius` and `yaw` (from the app
// or from the library's own code) go through these accessors and are clamped
// against whichever mode is current at the time of the write.
function installGuards(camera: GeospatialCamera, state: ModeState): void {
    let radius = camera.radius;
    let yaw = camera.yaw;

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radius,
        set: (value: number) => {
            radius = clampRadius(state, value);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yaw,
        set: (value: number) => {
            yaw = clampYaw(state, value);
        },
    });

    // Whole-pose writes may bypass the property setters if they store values
    // in their own closure, so clamp their arguments as well.
    const setOrientation = camera._setOrientation;
    camera._setOrientation = (newYaw, pitch, newRadius, center) => {
        setOrientation.call(
            camera,
            clampYaw(state, newYaw),
            pitch,
            clampRadius(state, newRadius),
            center,
        );
    };
}

/**
 * Makes `limits` the active zoom and heading range of `camera`.
 *
 * After this call, `camera.radius` stays within [limits.radiusMin, limits.radiusMax],
 * `camera.yaw` stays within [limits.yawMin, limits.yawMax], and `camera.limits`
 * is `limits`. Calling it again with another mode's limits switches the ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (state) {
        state.limits = limits;
    } else {
        state = { limits };
        states.set(camera, state);
        installGuards(camera, state);
    }

    camera.limits = limits;

    // Re-apply the current values so they fall inside the new range.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
