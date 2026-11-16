import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera state shared by the guards installed on it. `limits` is the
 * mode currently in effect; the guards read it on every write, so switching
 * modes only has to swap this reference.
 */
interface ModeState {
    limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

function clamp(value: number, lo: number, hi: number): number {
    return value < lo ? lo : value > hi ? hi : value;
}

function findDescriptor(obj: object, key: PropertyKey): PropertyDescriptor | undefined {
    for (let o: object | null = obj; o !== null; o = Object.getPrototypeOf(o)) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) return desc;
    }
    return undefined;
}

/**
 * Makes every write to `camera[key]` go through `clampValue` first. Works
 * whether the property is a plain data field or an accessor, and covers
 * writes made by the library itself (controls, fly, orientation) as well as
 * writes made by the app.
 */
function guardProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    clampValue: (value: number) => number,
): void {
    const desc = findDescriptor(camera, key);
    if (!desc) throw new Error(`GeospatialCamera has no "${key}" property`);

    if ("value" in desc) {
        let stored: number = desc.value;
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: desc.enumerable ?? true,
            get: () => stored,
            set: (value: number) => {
                stored = clampValue(value);
            },
        });
    } else {
        const originalGet = desc.get;
        const originalSet = desc.set;
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: desc.enumerable ?? true,
            get: () => (originalGet ? originalGet.call(camera) : undefined),
            set: (value: number) => {
                if (originalSet) originalSet.call(camera, clampValue(value));
            },
        });
    }
}

/**
 * Applies a mode's limits to the camera. Call it on every mode switch with
 * that mode's limits object. From then on, the radius (zoom) and yaw
 * (heading) written to the camera are clamped to that mode's ranges, and
 * `camera.limits` reports those limits.
 *
 * The limits object is only read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let state = states.get(camera);

    if (!state) {
        // First call for this camera: install the guards once. They read the
        // current mode from `state`, so later calls don't need to reinstall them.
        const s: ModeState = { limits };
        state = s;
        states.set(camera, s);

        guardProperty(camera, "radius", (v) => clamp(v, s.limits.radiusMin, s.limits.radiusMax));
        guardProperty(camera, "yaw", (v) => clamp(v, s.limits.yawMin, s.limits.yawMax));

        // setGeospatialOrientation and fly may write the pose through
        // _setOrientation rather than the fields, so clamp its arguments too.
        const originalSetOrientation = camera._setOrientation;
        camera._setOrientation = (yaw, pitch, radius, center) => {
            originalSetOrientation.call(
                camera,
                clamp(yaw, s.limits.yawMin, s.limits.yawMax),
                pitch,
                clamp(radius, s.limits.radiusMin, s.limits.radiusMax),
                center,
            );
        };
    } else {
        state.limits = limits;
    }

    camera.limits = limits;

    // The current pose may lie outside the new mode's ranges. Writing it back
    // goes through the guards, which clamp it.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
