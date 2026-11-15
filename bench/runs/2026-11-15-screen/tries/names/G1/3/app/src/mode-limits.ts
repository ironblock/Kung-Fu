import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// The limits currently in force for each camera. Replaced whenever the mode changes.
const activeLimits = new WeakMap<GeospatialCamera, GeospatialLimits>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampRadius(camera: GeospatialCamera, radius: number): number {
    const limits = activeLimits.get(camera)!;
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(camera: GeospatialCamera, yaw: number): number {
    const limits = activeLimits.get(camera)!;
    return clamp(yaw, limits.yawMin, limits.yawMax);
}

// Replaces the plain radius/yaw fields with accessors that clamp on every write,
// and wraps _setOrientation so orientation writes are clamped too.
// Installed once per camera; later mode switches only change activeLimits.
function installGuards(camera: GeospatialCamera): void {
    let radius = clampRadius(camera, camera.radius);
    let yaw = clampYaw(camera, camera.yaw);

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radius,
        set: (value: number) => {
            radius = clampRadius(camera, value);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yaw,
        set: (value: number) => {
            yaw = clampYaw(camera, value);
        },
    });

    const setOrientation = camera._setOrientation;
    camera._setOrientation = (newYaw, pitch, newRadius, center) => {
        setOrientation.call(
            camera,
            clampYaw(camera, newYaw),
            pitch,
            clampRadius(camera, newRadius),
            center,
        );
    };
}

/**
 * Applies a map mode's zoom (radius) and heading (yaw) ranges to the camera.
 * Call again with another mode's limits to switch modes.
 * The limits object is stored and read as-is; it is not modified here.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    if (activeLimits.has(camera)) {
        activeLimits.set(camera, limits);
    } else {
        activeLimits.set(camera, limits);
        installGuards(camera);
    }

    camera.limits = limits;

    // Bring the current values inside the new mode's ranges.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
