import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeLimitState {
    limits: GeospatialLimits;
    radius: number;
    yaw: number;
    setOrientation: GeospatialCamera["_setOrientation"];
}

const states = new WeakMap<GeospatialCamera, ModeLimitState>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// NaN input keeps the fallback value so a bad write cannot poison the state.
function clampOr(value: number, fallback: number, min: number, max: number): number {
    return clamp(Number.isNaN(value) ? fallback : value, min, max);
}

function attach(camera: GeospatialCamera, state: ModeLimitState): void {
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            state.radius = clampOr(value, state.radius, state.limits.radiusMin, state.limits.radiusMax);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            state.yaw = clampOr(value, state.yaw, state.limits.yawMin, state.limits.yawMax);
        },
    });

    const original = state.setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        original.call(
            camera,
            clampOr(yaw, state.yaw, state.limits.yawMin, state.limits.yawMax),
            pitch,
            clampOr(radius, state.radius, state.limits.radiusMin, state.limits.radiusMax),
            center,
        );
    };
}

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
        attach(camera, state);
    }

    state.limits = limits;
    camera.limits = limits;

    // Re-assigning through the accessors clamps the current values into this mode's ranges.
    camera.radius = state.radius;
    camera.yaw = state.yaw;
}
