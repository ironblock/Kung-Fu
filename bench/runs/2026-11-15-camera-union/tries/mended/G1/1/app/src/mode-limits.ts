import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state: the limits of the mode that is active right now.
// The limits object itself is never modified here; we only read it.
interface ModeLimitsState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeLimitsState>();

const TWO_PI = Math.PI * 2;

function clamp(value: number, lo: number, hi: number): number {
    return value < lo ? lo : value > hi ? hi : value;
}

// Map an angle into [-PI, PI), the range the camera reports its yaw in.
function wrapYaw(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
    return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    return clamp(wrapYaw(yaw), limits.yawMin, limits.yawMax);
}

function findDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    let current: object | null = obj;
    while (current) {
        const desc = Object.getOwnPropertyDescriptor(current, key);
        if (desc) return desc;
        current = Object.getPrototypeOf(current) as object | null;
    }
    return undefined;
}

// Replace camera[key] with an accessor that clamps every write against the
// active mode. If the library already defines an accessor for the key, its
// getter and setter are called underneath, so its own behaviour is kept.
function installClampedNumber(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clampFn: (limits: GeospatialLimits, value: number) => number,
    state: ModeLimitsState,
): void {
    const desc = findDescriptor(camera, key);
    let read: () => number;
    let write: (value: number) => void;

    if (desc && (desc.get || desc.set)) {
        const origGet = desc.get;
        const origSet = desc.set;
        read = () => (origGet ? (origGet.call(camera) as number) : NaN);
        write = (value) => {
            if (origSet) origSet.call(camera, value);
        };
    } else {
        let stored: number = camera[key];
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => read(),
        set: (value: number) => write(clampFn(state.limits, value)),
    });
}

function install(camera: GeospatialCamera, state: ModeLimitsState): void {
    installClampedNumber(camera, "radius", clampRadius, state);
    installClampedNumber(camera, "yaw", clampYaw, state);

    // The camera's own setter path for orientation (used by fly, controls and
    // setGeospatialOrientation) bypasses the public fields, so clamp its input too.
    const origSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        origSetOrientation.call(
            camera,
            clampYaw(state.limits, yaw),
            pitch,
            clampRadius(state.limits, radius),
            center,
        );
    };

    // Report the active mode's limits. Read-only from the outside.
    Object.defineProperty(camera, "limits", {
        configurable: true,
        enumerable: true,
        get: () => state.limits,
    });
}

/**
 * Makes `camera` use `limits` for zoom (radius) and heading (yaw), and
 * reports them through camera.limits. Call it again with another mode's
 * limits to switch. Radius and yaw writes made afterwards are clamped to the
 * active mode; the current values are clamped at once.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits };
        states.set(camera, state);
        install(camera, state);
    } else {
        state.limits = limits;
    }

    const radius = camera.radius;
    const clampedRadius = clampRadius(limits, radius);
    if (clampedRadius !== radius) camera.radius = clampedRadius;

    const yaw = camera.yaw;
    const clampedYaw = clampYaw(limits, yaw);
    if (clampedYaw !== yaw) camera.yaw = clampedYaw;
}
