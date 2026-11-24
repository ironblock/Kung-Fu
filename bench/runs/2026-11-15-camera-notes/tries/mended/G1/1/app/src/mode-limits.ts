import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type Clamp = (limits: GeospatialLimits, value: number) => number;

interface ModeState {
    // The limits of the mode that is currently active. Never mutated here.
    limits: GeospatialLimits;
    // Last accepted zoom and heading, kept so a mode switch can re-clamp them.
    radius: number;
    yaw: number;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

const TWO_PI = 2 * Math.PI;

// Wraps an angle into [-PI, PI), the same range the camera reports for yaw.
function wrapYaw(angle: number): number {
    let a = (angle + Math.PI) % TWO_PI;
    if (a < 0) a += TWO_PI;
    return a - Math.PI;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return Math.min(Math.max(radius, limits.radiusMin), limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return Math.min(Math.max(wrapYaw(yaw), limits.yawMin), limits.yawMax);
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
    let o: object | null = obj;
    while (o) {
        const d = Object.getOwnPropertyDescriptor(o, key);
        if (d) return d;
        o = Object.getPrototypeOf(o);
    }
    return undefined;
}

// Replaces camera[key] with an accessor that clamps every write against the
// state's current limits. Any original setter is still called, with the clamped value.
function guardSlot(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    state: ModeState,
    clamp: Clamp,
): void {
    const original = findDescriptor(camera, key);
    const forward = original?.set;
    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => state[key],
        set: (value: number) => {
            const clamped = clamp(state.limits, value);
            state[key] = clamped;
            forward?.call(camera, clamped);
        },
    });
}

function attach(camera: GeospatialCamera, limits: GeospatialLimits): ModeState {
    const existing = states.get(camera);
    if (existing) return existing;

    const state: ModeState = { limits, radius: camera.radius, yaw: camera.yaw };
    states.set(camera, state);

    guardSlot(camera, "radius", state, clampRadius);
    guardSlot(camera, "yaw", state, clampYaw);

    // setGeospatialOrientation-style writes go through _setOrientation,
    // so clamp their yaw and radius too.
    const setOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) =>
        setOrientation.call(
            camera,
            clampYaw(state.limits, yaw),
            pitch,
            clampRadius(state.limits, radius),
            center,
        );

    return state;
}

/**
 * Makes `camera` use the zoom (radius) and heading (yaw) ranges of `limits`.
 * Call it again with another mode's limits to switch modes.
 * The limits object is stored and read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    const state = attach(camera, limits);
    state.limits = limits;
    camera.limits = limits;

    // Re-clamp the current values into this mode's ranges, then write them through the guards.
    camera.radius = clampRadius(limits, state.radius);
    camera.yaw = clampYaw(limits, state.yaw);
}
