import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/*
 * Per-mode zoom (radius) and heading (yaw) ranges for a GeospatialCamera.
 *
 * Why this file wraps the camera's yaw and radius:
 *  - The library clamps radius against camera.limits on write, but its notes do not
 *    say it clamps yaw to yawMin/yawMax. So the heading range is enforced here.
 *  - Clamping radius here as well keeps the range guaranteed regardless of the library's
 *    internal clamping.
 *
 * The limits object passed in is never modified. Switching modes only changes which
 * limits object the camera's accessors read from.
 */

interface ModeBinding {
    limits: GeospatialLimits;
}

const bindings = new WeakMap<GeospatialCamera, ModeBinding>();

const TWO_PI = Math.PI * 2;

function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

// Wrap to [-PI, PI), the range the library reports yaw in.
function wrapYaw(angle: number): number {
    let a = (angle + Math.PI) % TWO_PI;
    if (a < 0) {
        a += TWO_PI;
    }
    return a - Math.PI;
}

function installAccessors(camera: GeospatialCamera, binding: ModeBinding): void {
    let yawValue = camera.yaw;
    let radiusValue = camera.radius;

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yawValue,
        set: (value: number) => {
            const { yawMin, yawMax } = binding.limits;
            yawValue = clamp(wrapYaw(value), yawMin, yawMax);
        },
    });

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radiusValue,
        set: (value: number) => {
            const { radiusMin, radiusMax } = binding.limits;
            radiusValue = clamp(value, radiusMin, radiusMax);
        },
    });
}

/**
 * Makes `limits` the active mode's limits for `camera`. Yaw and radius written to the
 * camera from then on are kept inside this mode's heading and zoom ranges, and
 * `camera.limits` reports this mode's object. Calling it again with another mode's
 * limits switches to that mode.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let binding = bindings.get(camera);
    if (binding) {
        binding.limits = limits;
    } else {
        binding = { limits };
        bindings.set(camera, binding);
        installAccessors(camera, binding);
    }

    // The library applies a new limits object at the next write, so set it first.
    camera.limits = limits;

    // Re-write the current values so they are clamped into the new mode's ranges now.
    camera.yaw = camera.yaw;
    camera.radius = camera.radius;
}
