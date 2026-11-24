import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// Keeps a GeospatialCamera's zoom (radius) and heading (yaw) inside the limits
// of the active map mode. Each call to useModeLimits makes `limits` the active
// set; the limits object itself is only read, never modified.
//
// The radius and yaw accessors and _setOrientation are wrapped on the camera
// instance, so every write the app makes (and any write routed through
// _setOrientation) is clamped against camera.limits at the moment of the write.

const TWO_PI = 2 * Math.PI;

const installed = new WeakSet<GeospatialCamera>();

function wrapToPi(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

function clampYaw(yaw: number, limits: GeospatialLimits): number {
    if (!Number.isFinite(yaw)) {
        return yaw;
    }
    // The camera reads yaw back wrapped to [-PI, PI), so clamp the wrapped value.
    return Math.min(Math.max(wrapToPi(yaw), limits.yawMin), limits.yawMax);
}

function clampRadius(radius: number, limits: GeospatialLimits): number {
    if (!Number.isFinite(radius)) {
        return radius;
    }
    return Math.min(Math.max(radius, limits.radiusMin), limits.radiusMax);
}

interface NumberAccess {
    get(): number;
    set(value: number): void;
}

// Finds the current getter/setter for `key`. If the property is a plain data
// property, its value is kept in a closure instead.
function accessFor(camera: GeospatialCamera, key: "yaw" | "radius"): NumberAccess {
    let owner: object | null = camera;
    while (owner) {
        const desc = Object.getOwnPropertyDescriptor(owner, key);
        if (desc) {
            if (desc.get || desc.set) {
                return {
                    get: () => (desc.get ? (desc.get.call(camera) as number) : NaN),
                    set: (value) => {
                        if (desc.set) {
                            desc.set.call(camera, value);
                        }
                    },
                };
            }
            break;
        }
        owner = Object.getPrototypeOf(owner);
    }
    let stored = camera[key];
    return {
        get: () => stored,
        set: (value) => {
            stored = value;
        },
    };
}

function install(camera: GeospatialCamera): void {
    if (installed.has(camera)) {
        return;
    }
    installed.add(camera);

    const yaw = accessFor(camera, "yaw");
    Object.defineProperty(camera, "yaw", {
        configurable: true,
        enumerable: true,
        get: () => yaw.get(),
        set: (value: number) => yaw.set(clampYaw(value, camera.limits)),
    });

    const radius = accessFor(camera, "radius");
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => radius.get(),
        set: (value: number) => radius.set(clampRadius(value, camera.limits)),
    });

    const setOrientation = camera._setOrientation;
    if (typeof setOrientation === "function") {
        camera._setOrientation = (yaw, pitch, zoom, center) => {
            setOrientation.call(
                camera,
                clampYaw(yaw, camera.limits),
                pitch,
                clampRadius(zoom, camera.limits),
                center,
            );
        };
    }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    install(camera);
    camera.limits = limits;

    // Changing camera.limits does not re-clamp the current pose, so clamp it now.
    const radius = camera.radius;
    const clampedRadius = clampRadius(radius, limits);
    if (clampedRadius !== radius) {
        camera.radius = clampedRadius;
    }

    const yaw = camera.yaw;
    const clampedYaw = clampYaw(yaw, limits);
    if (clampedYaw !== yaw) {
        camera.yaw = clampedYaw;
    }
}
