import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type Restore = () => void;

// Overrides installed by the most recent useModeLimits call, per camera.
const active = new WeakMap<GeospatialCamera, Restore>();

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Makes writes to `obj[key]` pass through `clampValue`, and returns a function
 * that puts the original property back.
 */
function overrideNumberProperty(obj: object, key: "yaw" | "radius", clampValue: (v: number) => number): Restore {
    const record = obj as Record<string, unknown>;
    const own = Object.getOwnPropertyDescriptor(obj, key);
    let inherited: PropertyDescriptor | undefined;
    for (let p = Object.getPrototypeOf(obj); p && !inherited; p = Object.getPrototypeOf(p)) {
        inherited = Object.getOwnPropertyDescriptor(p, key);
    }
    const base = own ?? inherited;
    const getter = base?.get;
    const setter = base?.set;
    const isAccessor = getter !== undefined || setter !== undefined;

    let stored = record[key] as number;
    const read = (): number => (getter ? (getter.call(obj) as number) : stored);
    const write = (v: number): void => {
        if (setter) {
            setter.call(obj, v);
        } else {
            stored = v;
        }
    };

    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: base?.enumerable ?? true,
        get: read,
        set: (v: number) => write(clampValue(v)),
    });

    return () => {
        const current = read();
        Reflect.deleteProperty(obj, key);
        if (own) {
            Object.defineProperty(obj, key, own.get || own.set ? own : { ...own, value: current });
        } else if (!isAccessor) {
            record[key] = current;
        }
    };
}

/** Clamps the yaw and radius arguments passed to the camera's _setOrientation. */
function overrideSetOrientation(
    camera: GeospatialCamera,
    clampYaw: (v: number) => number,
    clampRadius: (v: number) => number,
): Restore {
    const original = camera._setOrientation;
    const hadOwn = Object.prototype.hasOwnProperty.call(camera, "_setOrientation");
    camera._setOrientation = function (this: unknown, yaw, pitch, radius, center) {
        original.call(this, clampYaw(yaw), pitch, clampRadius(radius), center);
    };
    return () => {
        if (hadOwn) {
            camera._setOrientation = original;
        } else {
            Reflect.deleteProperty(camera, "_setOrientation");
        }
    };
}

/**
 * Applies a mode's zoom (radius) and heading (yaw) limits to the camera.
 * Any writes to camera.radius / camera.yaw / camera._setOrientation are clamped
 * to these limits, and camera.limits reports them. Calling again with another
 * mode's limits replaces the previous mode's limits.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    active.get(camera)?.();

    const clampYaw = (v: number): number => clamp(v, limits.yawMin, limits.yawMax);
    const clampRadius = (v: number): number => clamp(v, limits.radiusMin, limits.radiusMax);

    const restores: Restore[] = [
        overrideNumberProperty(camera, "yaw", clampYaw),
        overrideNumberProperty(camera, "radius", clampRadius),
        overrideSetOrientation(camera, clampYaw, clampRadius),
    ];

    camera.limits = limits;
    camera.yaw = clampYaw(camera.yaw);
    camera.radius = clampRadius(camera.radius);

    active.set(camera, () => {
        for (let i = restores.length - 1; i >= 0; i--) {
            restores[i]();
        }
    });
}
