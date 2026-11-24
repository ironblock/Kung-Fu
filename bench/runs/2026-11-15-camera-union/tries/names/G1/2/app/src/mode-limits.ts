import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera bookkeeping. The camera's `radius` and `yaw` are plain properties in
// the declarations, so they are replaced with accessors that clamp every write to
// the currently active mode's range. The active limits object is looked up on each
// write, so switching modes only has to swap the reference.
interface ModeLimitsState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
    setOrientation: GeospatialCamera["_setOrientation"];
}

const states = new WeakMap<GeospatialCamera, ModeLimitsState>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampRadius(state: ModeLimitsState, radius: number): number {
    return clamp(radius, state.limits.radiusMin, state.limits.radiusMax);
}

function clampYaw(state: ModeLimitsState, yaw: number): number {
    return clamp(yaw, state.limits.yawMin, state.limits.yawMax);
}

function install(camera: GeospatialCamera, state: ModeLimitsState): void {
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            if (Number.isFinite(value)) {
                state.radius = clampRadius(state, value);
            }
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            if (Number.isFinite(value)) {
                state.yaw = clampYaw(state, value);
            }
        },
    });

    // Bulk orientation writes (used by the library's orientation setter and fly
    // animations) go through here, so clamp their yaw and radius as well.
    const original = state.setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        const clampedYaw = clampYaw(state, yaw);
        const clampedRadius = clampRadius(state, radius);
        original(clampedYaw, pitch, clampedRadius, center);
        state.yaw = clampedYaw;
        state.radius = clampedRadius;
    };
}

/**
 * Makes `camera` use `limits` for zoom (radius) and heading (yaw).
 *
 * Calling it again with another mode's limits switches the camera to that mode.
 * The limits object is read but never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);

    if (!state) {
        state = {
            limits,
            radius: camera.radius,
            yaw: camera.yaw,
            setOrientation: camera._setOrientation,
        };
        states.set(camera, state);
        install(camera, state);
    } else {
        state.limits = limits;
    }

    // Bring the current values into the new mode's range.
    state.radius = clampRadius(state, state.radius);
    state.yaw = clampYaw(state, state.yaw);

    camera.limits = limits;
}
