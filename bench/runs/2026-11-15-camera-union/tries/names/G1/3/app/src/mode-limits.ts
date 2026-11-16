import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface Binding {
    // The limits currently enforced on this camera. Always a private copy,
    // so the caller's per-mode object is never touched.
    limits: GeospatialLimits;
}

// One binding per camera. Accessors are installed once; switching modes only
// swaps `binding.limits`, so the previous mode's ranges stop applying.
const bindings = new WeakMap<GeospatialCamera, Binding>();

function copyLimits(limits: GeospatialLimits): GeospatialLimits {
    return {
        ...limits,
        pitchDisabledRadiusScale: limits.pitchDisabledRadiusScale
            ? { x: limits.pitchDisabledRadiusScale.x, y: limits.pitchDisabledRadiusScale.y }
            : null,
    };
}

function clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) {
        return NaN;
    }
    return value < min ? min : value > max ? max : value;
}

function clampRadius(binding: Binding, radius: number): number {
    return clamp(radius, binding.limits.radiusMin, binding.limits.radiusMax);
}

function clampYaw(binding: Binding, yaw: number): number {
    return clamp(yaw, binding.limits.yawMin, binding.limits.yawMax);
}

// Replaces a plain data property with an accessor that clamps on every write.
function interceptProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clampValue: (value: number) => number,
): void {
    const existing = Object.getOwnPropertyDescriptor(camera, key);
    if (existing && !existing.configurable) {
        throw new Error(`useModeLimits: camera.${key} is not configurable; limits cannot be enforced`);
    }
    let stored = clampValue(camera[key]);
    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: existing ? existing.enumerable : true,
        get(): number {
            return stored;
        },
        set(value: number) {
            // NaN is ignored so an invalid write keeps the last valid value.
            if (Number.isNaN(value)) {
                return;
            }
            stored = clampValue(value);
        },
    });
}

function install(camera: GeospatialCamera, binding: Binding): void {
    interceptProperty(camera, "radius", (v) => clampRadius(binding, v));
    interceptProperty(camera, "yaw", (v) => clampYaw(binding, v));

    // Internal orientation writes bypass the public properties, so clamp their
    // arguments as well.
    const original = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        original.call(camera, clampYaw(binding, yaw), pitch, clampRadius(binding, radius), center);
    };
}

/**
 * Applies a map mode's zoom (radius) and heading (yaw) limits to a geospatial camera.
 * Call again with another mode's limits to switch modes. The limits object passed in
 * is copied and never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let binding = bindings.get(camera);
    if (!binding) {
        binding = { limits: copyLimits(limits) };
        bindings.set(camera, binding);
        install(camera, binding);
    } else {
        binding.limits = copyLimits(limits);
    }

    camera.limits = binding.limits;

    // Bring the current zoom and heading into the new mode's ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
