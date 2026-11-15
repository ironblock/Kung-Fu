import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface Range {
    readonly min: number;
    readonly max: number;
}

interface ModeRanges {
    readonly radius: Range;
    readonly yaw: Range;
}

// Ranges of the mode that is currently active, per camera. The accessors
// installed on a camera read from here, so switching modes only has to
// replace the entry.
const activeRanges = new WeakMap<GeospatialCamera, ModeRanges>();
const patchedCameras = new WeakSet<GeospatialCamera>();

function readRange(min: unknown, max: unknown, name: string): Range {
    if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max) || min > max) {
        throw new RangeError(`mode-limits: invalid ${name} range (${String(min)}, ${String(max)})`);
    }
    return { min, max };
}

function readModeRanges(limits: GeospatialLimits): ModeRanges {
    // Zoom bounds are the library's own fields.
    const radius = readRange(limits.radiusMin, limits.radiusMax, "radius");
    // Heading bounds are not documented in the library notes; they are read
    // from the limits object as yawMin / yawMax. Adjust if the names differ.
    const raw = limits as unknown as { yawMin?: unknown; yawMax?: unknown };
    const yaw = readRange(raw.yawMin, raw.yawMax, "yaw");
    return { radius, yaw };
}

function clamp(value: number, range: Range): number {
    if (!Number.isFinite(value)) {
        throw new RangeError(`mode-limits: cannot clamp non-finite value ${value}`);
    }
    return Math.min(range.max, Math.max(range.min, value));
}

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    let obj: object | null = target;
    while (obj) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc) return desc;
        obj = Object.getPrototypeOf(obj);
    }
    return undefined;
}

// Replaces `camera[key]` with an accessor on the instance that clamps every
// write to the active mode's range before passing it to the original storage.
function patchProperty(camera: GeospatialCamera, key: "radius" | "yaw"): void {
    const original = findDescriptor(camera, key);
    const originalGet = original?.get;
    const originalSet = original?.set;
    let ownValue = original && "value" in original ? (original.value as number) : undefined;

    Object.defineProperty(camera, key, {
        configurable: true,
        enumerable: true,
        get(): number {
            return originalGet ? originalGet.call(camera) : (ownValue as number);
        },
        set(value: number): void {
            const ranges = activeRanges.get(camera);
            if (!ranges) {
                throw new Error("mode-limits: no mode is active for this camera");
            }
            const clamped = clamp(value, ranges[key]);
            if (originalSet) {
                originalSet.call(camera, clamped);
            } else {
                ownValue = clamped;
            }
        },
    });
}

/**
 * Makes `limits` the active limits of `camera`: zoom (`radius`) and heading
 * (`yaw`) writes are kept inside this mode's ranges, and `camera.limits`
 * reports `limits`. Call again with another mode's limits to switch.
 * `limits` itself is only read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    activeRanges.set(camera, readModeRanges(limits));

    if (!patchedCameras.has(camera)) {
        patchProperty(camera, "radius");
        patchProperty(camera, "yaw");
        patchedCameras.add(camera);
    }

    camera.limits = limits;

    // Bring the current pose inside the new ranges now. Each write goes
    // through the clamping accessors above.
    camera.radius = camera.radius;
    camera.yaw = camera.yaw;
}
