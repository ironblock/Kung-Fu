import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

const activeLimits = new WeakMap<GeospatialCamera, GeospatialLimits>();
const installed = new WeakSet<GeospatialCamera>();

const TWO_PI = Math.PI * 2;
const EPS = 1e-9;

function clampRadius(limits: GeospatialLimits, radius: number): number {
    if (!Number.isFinite(radius)) {
        return radius;
    }

    let min = limits.radiusMin;
    let max = limits.radiusMax;

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return radius;
    }

    if (min > max) {
        const swap = min;
        min = max;
        max = swap;
    }

    return Math.min(Math.max(radius, min), max);
}

function normalize01(angle: number): number {
    const value = angle % TWO_PI;
    return value < 0 ? value + TWO_PI : value;
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
    if (!Number.isFinite(yaw)) {
        return yaw;
    }

    const min = limits.yawMin;
    const max = limits.yawMax;

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return yaw;
    }

    // A range covering a full circle imposes no heading limit.
    if (max - min >= TWO_PI - EPS || min - max >= TWO_PI - EPS) {
        return normalize01(yaw);
    }

    const minN = normalize01(min);
    const maxN = normalize01(max);
    const y = normalize01(yaw);

    if (Math.abs(minN - maxN) < EPS) {
        return minN;
    }

    if (minN < maxN) {
        return Math.min(Math.max(y, minN), maxN);
    }

    // Wrap-around range, e.g. 350deg..10deg.
    if (y >= minN || y <= maxN) {
        return y;
    }

    const distanceToMax = (y - maxN + TWO_PI) % TWO_PI;
    const distanceToMin = (minN - y + TWO_PI) % TWO_PI;

    return distanceToMax <= distanceToMin ? maxN : minN;
}

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    let current: object | null = target;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (descriptor) {
            return descriptor;
        }
        current = Object.getPrototypeOf(current);
    }

    return undefined;
}

function install(camera: GeospatialCamera): void {
    const c = camera as any;

    const limitsDescriptor = findDescriptor(c, "limits");
    const radiusDescriptor = findDescriptor(c, "radius");
    const yawDescriptor = findDescriptor(c, "yaw");
    const setOrientationDescriptor = findDescriptor(c, "_setOrientation");

    const limitsSet = limitsDescriptor?.set;
    const radiusGet = radiusDescriptor?.get;
    const radiusSet = radiusDescriptor?.set;
    const yawGet = yawDescriptor?.get;
    const yawSet = yawDescriptor?.set;

    const originalSetOrientation = setOrientationDescriptor
        ? setOrientationDescriptor.get
            ? setOrientationDescriptor.get.call(c)
            : setOrientationDescriptor.value
        : c._setOrientation;

    let radiusValue = c.radius;
    let yawValue = c.yaw;
    let applying = false;

    const applyOrientation = (): void => {
        if (!originalSetOrientation || applying) {
            return;
        }

        applying = true;
        try {
            originalSetOrientation.call(c, yawValue, c.pitch, radiusValue, c.center);
        } finally {
            applying = false;
        }
    };

    Object.defineProperty(c, "limits", {
        get: () => activeLimits.get(camera)!,
        set: (value: GeospatialLimits) => {
            activeLimits.set(camera, value);
            if (limitsSet) {
                limitsSet.call(c, value);
            }
        },
        configurable: true,
        enumerable: true,
    });

    Object.defineProperty(c, "radius", {
        get: () => {
            const limits = activeLimits.get(camera)!;
            const raw = radiusGet ? radiusGet.call(c) : radiusValue;
            return clampRadius(limits, raw);
        },
        set: (value: number) => {
            const limits = activeLimits.get(camera)!;
            radiusValue = clampRadius(limits, value);

            if (radiusSet) {
                radiusSet.call(c, radiusValue);
            } else {
                applyOrientation();
            }
        },
        configurable: true,
        enumerable: true,
    });

    Object.defineProperty(c, "yaw", {
        get: () => {
            const limits = activeLimits.get(camera)!;
            const raw = yawGet ? yawGet.call(c) : yawValue;
            return clampYaw(limits, raw);
        },
        set: (value: number) => {
            const limits = activeLimits.get(camera)!;
            yawValue = clampYaw(limits, value);

            if (yawSet) {
                yawSet.call(c, yawValue);
            } else {
                applyOrientation();
            }
        },
        configurable: true,
        enumerable: true,
    });

    if (originalSetOrientation) {
        const wrapped = (yaw: number, pitch: number, radius: number, center: unknown) => {
            const limits = activeLimits.get(camera)!;
            const clampedYaw = clampYaw(limits, yaw);
            const clampedRadius = clampRadius(limits, radius);

            yawValue = clampedYaw;
            radiusValue = clampedRadius;

            applying = true;
            try {
                return originalSetOrientation.call(c, clampedYaw, pitch, clampedRadius, center);
            } finally {
                applying = false;
            }
        };

        Object.defineProperty(c, "_setOrientation", {
            value: wrapped,
            writable: true,
            configurable: true,
            enumerable: false,
        });
    }

    installed.add(camera);
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    activeLimits.set(camera, limits);

    if (!installed.has(camera)) {
        install(camera);
    }

    (camera as any).limits = limits;

    const c = camera as any;

    if (typeof c._setOrientation === "function") {
        c._setOrientation(c.yaw, c.pitch, c.radius, c.center);
    } else {
        c.radius = c.radius;
        c.yaw = c.yaw;
    }
}
