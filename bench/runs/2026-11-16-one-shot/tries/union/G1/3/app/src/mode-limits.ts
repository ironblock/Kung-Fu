import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeState {
    limits: GeospatialLimits;
    yaw: number;
    radius: number;
    readonly originalSetOrientation: GeospatialCamera["_setOrientation"];
}

const TWO_PI = Math.PI * 2;
const states = new WeakMap<GeospatialCamera, ModeState>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

// Yaw reads back wrapped to [-PI, PI), so wrap first, then clamp to the mode's heading range.
function clampYaw(limits: GeospatialLimits, yaw: number): number {
    const wrapped = ((((yaw + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
    return clamp(wrapped, limits.yawMin, limits.yawMax);
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function install(camera: GeospatialCamera, limits: GeospatialLimits): ModeState {
    const state: ModeState = {
        limits,
        yaw: camera.yaw,
        radius: camera.radius,
        originalSetOrientation: camera._setOrientation,
    };

    Object.defineProperty(camera, "limits", {
        configurable: true,
        enumerable: true,
        get: () => state.limits,
        set: () => {
            throw new TypeError("camera.limits is changed only through useModeLimits");
        },
    });

    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => state.yaw,
        set: (value: number) => {
            if (Number.isFinite(value)) {
                state.yaw = clampYaw(state.limits, value);
            }
        },
    });

    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => state.radius,
        set: (value: number) => {
            if (Number.isFinite(value)) {
                state.radius = clampRadius(state.limits, value);
            }
        },
    });

    // Clamp the values passed to the library's orientation write, so that path cannot bypass the limits.
    camera._setOrientation = (yaw, pitch, radius, center) => {
        state.originalSetOrientation.call(
            camera,
            Number.isFinite(yaw) ? clampYaw(state.limits, yaw) : state.yaw,
            pitch,
            Number.isFinite(radius) ? clampRadius(state.limits, radius) : state.radius,
            center,
        );
    };

    return state;
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (state === undefined) {
        state = install(camera, limits);
        states.set(camera, state);
    }

    // Read the mode's limits only; the object itself is never modified.
    state.limits = limits;

    // Bring the current pose inside this mode's ranges right away.
    const yaw = clampYaw(limits, state.yaw);
    const radius = clampRadius(limits, state.radius);
    if (yaw !== state.yaw || radius !== state.radius) {
        // Radius is applied together with pitch so the library re-clamps pitch against it.
        camera._setOrientation(yaw, camera.pitch, radius, camera.center);
    }
}
