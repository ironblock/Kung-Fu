import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type Range = readonly [min: number, max: number];

/** Cameras whose `radius` and `yaw` already route through the clamping guard. */
const guarded = new WeakSet<GeospatialCamera>();

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    for (let o: object | null = target; o !== null; o = Object.getPrototypeOf(o)) {
        const desc = Object.getOwnPropertyDescriptor(o, key);
        if (desc) return desc;
    }
    return undefined;
}

function clampTo(value: number, [min, max]: Range): number {
    return value < min ? min : value > max ? max : value;
}

/**
 * Replace `camera[key]` with an accessor that clamps every write into the range
 * returned by `rangeOf(camera.limits)`. The range is read at write time, so a
 * later `useModeLimits` call (which swaps `camera.limits`) changes the bounds
 * without re-wrapping the property.
 */
function guardProperty(
    camera: GeospatialCamera,
    key: "radius" | "yaw",
    rangeOf: (limits: GeospatialLimits) => Range,
): void {
    const desc = findDescriptor(camera, key);
    const origGet = desc?.get;
    const origSet = desc?.set;
    let slot = camera[key]; // backing storage when the original is a plain data property

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get: () => (origGet ? origGet.call(camera) : slot),
        set: (value: number) => {
            const clamped = clampTo(value, rangeOf(camera.limits));
            if (origSet) {
                origSet.call(camera, clamped);
            } else {
                slot = clamped;
            }
        },
    });
}

const radiusRange = (l: GeospatialLimits): Range => [l.radiusMin, l.radiusMax];
const yawRange = (l: GeospatialLimits): Range => [l.yawMin, l.yawMax];

/**
 * Make `limits` the active limits for `camera`. Every later write to `radius` or
 * `yaw` is clamped into this mode's ranges, and `camera.limits` reports this mode's
 * object. Calling it again with another mode's limits switches the ranges.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    camera.limits = limits;

    if (!guarded.has(camera)) {
        guardProperty(camera, "radius", radiusRange);
        guardProperty(camera, "yaw", yawRange);
        guarded.add(camera);
    }

    // The pose may already be outside the new mode's ranges; writing it back runs it through the guard.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
