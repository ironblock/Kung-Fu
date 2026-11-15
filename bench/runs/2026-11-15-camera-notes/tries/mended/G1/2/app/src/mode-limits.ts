import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeState {
    // The limits object of the mode the camera is currently in. Read live by the
    // guards below; the app never mutates a mode's limits object after creating it.
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

// Replaces the camera's yaw and radius data properties with accessors so that every
// write made through the camera object is clamped to the current mode's ranges.
function installGuards(camera: GeospatialCamera, state: ModeState): void {
    let yaw = camera.yaw;
    let radius = camera.radius;

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yaw,
        set: (value: number) => {
            yaw = clamp(value, state.limits.yawMin, state.limits.yawMax);
        },
    });

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radius,
        set: (value: number) => {
            radius = clamp(value, state.limits.radiusMin, state.limits.radiusMax);
        },
    });
}

/**
 * Makes `limits` the active limits of `camera`. Call it again with another mode's
 * limits object to switch modes. Any yaw or radius written to the camera afterwards
 * is kept inside the active mode's heading and zoom ranges, and `camera.limits`
 * reports the active mode's object.
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

    // Bring the current pose inside the new mode's ranges. Writing through the
    // accessors runs the setters, which clamp.
    camera.yaw = camera.yaw;
    camera.radius = camera.radius;
}
