import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface CameraModeState {
    /** Limits of the mode the camera is currently in. Never mutated here. */
    limits: GeospatialLimits;
    /** Last accepted radius (already clamped). */
    radius: number;
    /** Last accepted yaw (already clamped). */
    yaw: number;
}

const states = new WeakMap<GeospatialCamera, CameraModeState>();

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clamp(yaw, limits.yawMin, limits.yawMax);
}

/**
 * Makes `radius` and `yaw` writes on the camera respect the limits of the
 * current mode. Call it on every mode switch with that mode's limits object.
 *
 * The first call on a camera installs accessors for `radius` and `yaw` and
 * wraps `_setOrientation`; later calls only swap the limits in use, so the
 * same hooks serve every mode.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);

    if (!state) {
        const newState: CameraModeState = {
            limits,
            radius: camera.radius,
            yaw: camera.yaw,
        };
        state = newState;
        states.set(camera, newState);
        installHooks(camera, newState);
    }

    state.limits = limits;
    camera.limits = limits;

    // The camera may already hold values from the previous mode; bring them into range.
    state.radius = clampRadius(limits, state.radius);
    state.yaw = clampYaw(limits, state.yaw);
}

function installHooks(camera: GeospatialCamera, state: CameraModeState): void {
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get(): number {
            return state.radius;
        },
        set(value: number) {
            state.radius = clampRadius(state.limits, value);
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get(): number {
            return state.yaw;
        },
        set(value: number) {
            state.yaw = clampYaw(state.limits, value);
        },
    });

    // Orientation writes that go through the library's own setter must be clamped too.
    const original = camera._setOrientation;
    const clampedSetOrientation: GeospatialCamera["_setOrientation"] = (yaw, pitch, radius, center) => {
        const y = clampYaw(state.limits, yaw);
        const r = clampRadius(state.limits, radius);
        state.yaw = y;
        state.radius = r;
        original.call(camera, y, pitch, r, center);
    };
    camera._setOrientation = clampedSetOrientation;
}
