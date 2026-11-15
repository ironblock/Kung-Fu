import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Per-camera state. One entry per camera; the accessor hooks below read
// `limits` at each write, so switching modes only has to swap this field.
interface HookState {
    limits: GeospatialLimits;
}

const TWO_PI = 2 * Math.PI;
const states = new WeakMap<GeospatialCamera, HookState>();

function wrapYaw(v: number): number {
    // Same [-PI, PI) range the camera reads back (see notes item 26).
    if (v >= -Math.PI && v < Math.PI) return v;
    const w = (((v + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI;
    return w - Math.PI;
}

function clampRadius(v: number, limits: GeospatialLimits): number {
    return Math.min(Math.max(v, limits.radiusMin), limits.radiusMax);
}

function clampYaw(v: number, limits: GeospatialLimits): number {
    return Math.min(Math.max(wrapYaw(v), limits.yawMin), limits.yawMax);
}

function requireNumber(v: unknown, name: string): number {
    if (typeof v !== "number" || Number.isNaN(v)) {
        throw new Error(`GeospatialLimits.${name} must be a number`);
    }
    return v;
}

function validate(limits: GeospatialLimits): void {
    const rMin = requireNumber(limits.radiusMin, "radiusMin");
    const rMax = requireNumber(limits.radiusMax, "radiusMax");
    const yMin = requireNumber(limits.yawMin, "yawMin");
    const yMax = requireNumber(limits.yawMax, "yawMax");
    if (rMin > rMax) throw new Error("GeospatialLimits: radiusMin > radiusMax");
    if (yMin > yMax) throw new Error("GeospatialLimits: yawMin > yawMax");
}

// Replace `camera[key]` with an accessor that clamps every write before
// passing it to the original setter (or storage, for a plain data property).
function hook(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (v: number, limits: GeospatialLimits) => number,
): void {
    let desc: PropertyDescriptor | undefined;
    for (let o: object | null = camera; o !== null && desc === undefined; o = Object.getPrototypeOf(o)) {
        desc = Object.getOwnPropertyDescriptor(o, key);
    }
    if (desc === undefined) {
        throw new Error(`GeospatialCamera has no "${key}" property`);
    }

    const origGet = desc.get;
    const origSet = desc.set;
    let stored = desc.value as number;
    const state = states.get(camera);
    if (state === undefined) throw new Error("mode-limits: camera state missing");

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get(): number {
            return origGet ? origGet.call(camera) : stored;
        },
        set(v: number) {
            const c = clamp(v, state.limits);
            if (origSet) {
                origSet.call(camera, c);
            } else {
                stored = c;
            }
        },
    });
}

/**
 * Makes `limits` the active mode limits for `camera`.
 *
 * After this call, every radius and yaw written to the camera is clamped into
 * this mode's ranges, and `camera.limits` reports `limits`. Calling it again
 * with another mode's limits switches to those ranges. Hooks are installed
 * once per camera; later calls only swap the limits they read. The limits
 * object is never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    validate(limits);

    let state = states.get(camera);
    if (state === undefined) {
        state = { limits };
        states.set(camera, state);
        hook(camera, "radius", clampRadius);
        hook(camera, "yaw", clampYaw);
    } else {
        state.limits = limits;
    }

    camera.limits = limits;

    // The library re-clamps nothing when limits change, so clamp the current
    // pose now. Only write when the value actually changes, since writing an
    // unchanged value is skipped by the camera.
    const r = camera.radius;
    const cr = clampRadius(r, limits);
    if (cr !== r) camera.radius = cr;

    const y = camera.yaw;
    const cy = clampYaw(y, limits);
    if (cy !== y) camera.yaw = cy;
}
