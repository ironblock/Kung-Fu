import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeState {
    limits: GeospatialLimits;
}

// One state per camera. The clamps read `state.limits` on every write, so
// switching modes only has to change that reference.
const states = new WeakMap<GeospatialCamera, ModeState>();

function clampTo(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

function findDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    let o: object | null = obj;
    while (o) {
        const d = Object.getOwnPropertyDescriptor(o, key);
        if (d) return d;
        o = Object.getPrototypeOf(o);
    }
    return undefined;
}

// Replaces `camera[key]` with an accessor that clamps every write and then
// forwards to whatever the library had there before (accessor or plain data).
function wrapNumericProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clamp: (value: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    let read: () => number;
    let write: (value: number) => void;

    if (desc && (desc.get || desc.set)) {
        const origGet = desc.get;
        const origSet = desc.set;
        read = () => (origGet ? origGet.call(camera) : NaN);
        write = (value) => {
            if (origSet) origSet.call(camera, value);
        };
    } else {
        let stored = desc?.value as number;
        read = () => stored;
        write = (value) => {
            stored = value;
        };
    }

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: read,
        set: (value: number) => write(clamp(value)),
    });
}

function installClamps(camera: GeospatialCamera, state: ModeState): void {
    const clampRadius = (r: number) =>
        clampTo(r, state.limits.radiusMin, state.limits.radiusMax);
    const clampYaw = (y: number) =>
        clampTo(y, state.limits.yawMin, state.limits.yawMax);

    wrapNumericProperty(camera, "radius", clampRadius);
    wrapNumericProperty(camera, "yaw", clampYaw);

    // Bulk writer used by setGeospatialOrientation and similar paths.
    const origSetOrientation = camera._setOrientation;
    camera._setOrientation = (yaw, pitch, radius, center) => {
        origSetOrientation.call(camera, clampYaw(yaw), pitch, clampRadius(radius), center);
    };
}

/**
 * Makes `camera` use `limits` for its zoom (radius) and heading (yaw) ranges.
 * Call it again with another mode's limits to switch modes. The limits object
 * is referenced, not copied, and must not be modified after creation.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);
    if (!state) {
        state = { limits };
        states.set(camera, state);
        installClamps(camera, state);
    }

    state.limits = limits;
    camera.limits = limits;

    // Bring the current pose inside this mode's ranges. Going through the
    // clamped setters also re-clamps pitch against the new radius.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
