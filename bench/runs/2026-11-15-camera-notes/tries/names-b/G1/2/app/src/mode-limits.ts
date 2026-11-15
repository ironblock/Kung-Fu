import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeLimitsState {
    /** Limits currently in force for this camera. */
    current: GeospatialLimits;
}

// One state record per camera. The accessors installed on the first call
// stay in place and read `state.current`, so later calls only swap the limits.
const states = new WeakMap<GeospatialCamera, ModeLimitsState>();

function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

/**
 * Applies a mode's zoom (radius) and heading (yaw) ranges to the camera.
 *
 * Writes to `camera.radius` and `camera.yaw` are clamped to the active
 * limits, `_setOrientation` is wrapped so its inputs are clamped too, and
 * `camera.limits` is set to `limits`. Calling this again with another mode's
 * limits switches the ranges. The limits object itself is never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const existing = states.get(camera);
    if (existing) {
        existing.current = limits;
        camera.limits = limits;
        // Pull the current values into the new range.
        camera.radius = camera.radius;
        camera.yaw = camera.yaw;
        return;
    }

    const state: ModeLimitsState = { current: limits };
    states.set(camera, state);

    const clampRadius = (r: number): number =>
        clamp(r, state.current.radiusMin, state.current.radiusMax);
    const clampYaw = (y: number): number =>
        clamp(y, state.current.yawMin, state.current.yawMax);

    let radiusValue = clampRadius(camera.radius);
    let yawValue = clampYaw(camera.yaw);

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radiusValue,
        set: (value: number) => {
            radiusValue = clampRadius(value);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yawValue,
        set: (value: number) => {
            yawValue = clampYaw(value);
        },
    });

    // Code that sets orientation in one call bypasses the property setters
    // above, so clamp its inputs as well.
    const originalSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        originalSetOrientation(clampYaw(yaw), pitch, clampRadius(radius), center);
    };

    camera.limits = limits;
}
