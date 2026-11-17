import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type ModeProperty = "radius" | "yaw";

interface ModeLimitState {
    limits: GeospatialLimits;
    radiusDescriptor?: PropertyDescriptor;
    yawDescriptor?: PropertyDescriptor;
    radiusValue: number;
    yawValue: number;
    wrappedRadius: boolean;
    wrappedYaw: boolean;
}

const cameraStates = new WeakMap<GeospatialCamera, ModeLimitState>();

const PI = Math.PI;
const TWO_PI = PI * 2;

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function fallbackLimits(): GeospatialLimits {
    return {
        planetRadius: 0,
        radiusMin: -Infinity,
        radiusMax: Infinity,
        pitchMin: -Infinity,
        pitchMax: Infinity,
        pitchDisabledRadiusScale: null,
        yawMin: -Infinity,
        yawMax: Infinity,
    };
}

function normalizeYaw(angle: number): number {
    if (!isFiniteNumber(angle)) return 0;

    let wrapped = angle % TWO_PI;
    if (wrapped >= PI) wrapped -= TWO_PI;
    else if (wrapped < -PI) wrapped += TWO_PI;

    return wrapped;
}

function circularDistance(a: number, b: number): number {
    return Math.abs(normalizeYaw(a - b));
}

function clampRadius(limits: GeospatialLimits, value: number, fallback: number): number {
    if (!isFiniteNumber(value)) {
        if (isFiniteNumber(fallback)) return fallback;
        if (isFiniteNumber(limits.radiusMin)) return limits.radiusMin;
        if (isFiniteNumber(limits.radiusMax)) return limits.radiusMax;
        return 0;
    }

    const min = isFiniteNumber(limits.radiusMin) ? limits.radiusMin : -Infinity;
    const max = isFiniteNumber(limits.radiusMax) ? limits.radiusMax : Infinity;

    const low = Math.min(min, max);
    const high = Math.max(min, max);

    if (low === high) return low;

    let clamped = value;
    if (clamped < low) clamped = low;
    else if (clamped > high) clamped = high;

    return clamped;
}

function clampYaw(limits: GeospatialLimits, value: number, fallback: number): number {
    if (!isFiniteNumber(value)) {
        if (isFiniteNumber(fallback)) return normalizeYaw(fallback);
        if (isFiniteNumber(limits.yawMin)) return normalizeYaw(limits.yawMin);
        if (isFiniteNumber(limits.yawMax)) return normalizeYaw(limits.yawMax);
        return 0;
    }

    const min = limits.yawMin;
    const max = limits.yawMax;

    if (!isFiniteNumber(min) || !isFiniteNumber(max)) {
        const target = normalizeYaw(value);

        if (isFiniteNumber(min) && target < min) return normalizeYaw(min);
        if (isFiniteNumber(max) && target > max) return normalizeYaw(max);

        return target;
    }

    if (min === max) return normalizeYaw(min);

    // A range spanning at least a full turn is effectively unrestricted.
    if (min <= max && max - min >= TWO_PI) return normalizeYaw(value);

    const target = normalizeYaw(value);

    let allowed = false;

    if (min <= max) {
        allowed = target >= min && target <= max;

        // ±PI are the same heading, and the camera wraps PI to -PI.
        if (!allowed && max === PI && target === -PI) allowed = true;
        if (!allowed && min === -PI && target === PI) allowed = true;
    } else {
        // Wrapped range: [min, PI] plus [-PI, max].
        allowed = target >= min || target <= max;

        if (!allowed && max === PI && target === -PI) allowed = true;
        if (!allowed && min === -PI && target === PI) allowed = true;
    }

    if (allowed) return target;

    const minBoundary = normalizeYaw(min);
    const maxBoundary = max === PI ? -PI : normalizeYaw(max);

    const dMin = circularDistance(target, minBoundary);
    const dMax = circularDistance(target, maxBoundary);

    return dMin <= dMax ? minBoundary : maxBoundary;
}

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
    let current: object | null = target;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, key);
        if (descriptor) return descriptor;

        current = Object.getPrototypeOf(current) as object | null;
    }

    return undefined;
}

function readInitial(
    camera: GeospatialCamera,
    descriptor: PropertyDescriptor | undefined,
    key: ModeProperty
): number {
    if (descriptor?.get && descriptor?.set) {
        try {
            const value = descriptor.get.call(camera);
            if (isFiniteNumber(value)) return value;
        } catch {
            // fall through
        }
    }

    if (descriptor?.get) {
        try {
            const value = descriptor.get.call(camera);
            if (isFiniteNumber(value)) return value;
        } catch {
            // fall through
        }
    }

    if (descriptor && "value" in descriptor && isFiniteNumber(descriptor.value)) {
        return descriptor.value;
    }

    const direct = key === "radius" ? camera.radius : camera.yaw;
    return isFiniteNumber(direct) ? direct : 0;
}

function readRaw(camera: GeospatialCamera, state: ModeLimitState, key: ModeProperty): number {
    const descriptor = key === "radius" ? state.radiusDescriptor : state.yawDescriptor;
    const wrapped = key === "radius" ? state.wrappedRadius : state.wrappedYaw;

    // If the original property is a normal getter/setter pair, use the original getter
    // to read the library's actual internal value.
    if (descriptor?.get && descriptor?.set) {
        try {
            const value = descriptor.get.call(camera);
            if (isFiniteNumber(value)) return value;
        } catch {
            // fall through
        }
    }

    // If we replaced a plain data property, our wrapper keeps the latest value.
    if (wrapped) {
        return key === "radius" ? state.radiusValue : state.yawValue;
    }

    // If wrapping failed but there is still an original getter, use it.
    if (descriptor?.get) {
        try {
            const value = descriptor.get.call(camera);
            if (isFiniteNumber(value)) return value;
        } catch {
            // fall through
        }
    }

    const direct = key === "radius" ? camera.radius : camera.yaw;
    if (isFiniteNumber(direct)) return direct;

    if (descriptor && "value" in descriptor && isFiniteNumber(descriptor.value)) {
        return descriptor.value;
    }

    return 0;
}

function getModeValue(camera: GeospatialCamera, state: ModeLimitState, key: ModeProperty): number {
    const raw = readRaw(camera, state, key);

    return key === "radius"
        ? clampRadius(state.limits, raw, raw)
        : clampYaw(state.limits, raw, raw);
}

function setModeValue(
    camera: GeospatialCamera,
    state: ModeLimitState,
    key: ModeProperty,
    value: number
): void {
    const descriptor = key === "radius" ? state.radiusDescriptor : state.yawDescriptor;
    const raw = readRaw(camera, state, key);

    const clamped = key === "radius"
        ? clampRadius(state.limits, value, raw)
        : clampYaw(state.limits, value, raw);

    if (descriptor?.set) {
        descriptor.set.call(camera, clamped);
    } else if (key === "radius") {
        state.radiusValue = clamped;
    } else {
        state.yawValue = clamped;
    }
}

function installProperty(
    camera: GeospatialCamera,
    state: ModeLimitState,
    key: ModeProperty
): boolean {
    try {
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: true,
            get() {
                return getModeValue(camera, state, key);
            },
            set(value: number) {
                setModeValue(camera, state, key, value);
            },
        });

        return true;
    } catch {
        return false;
    }
}

function ensureState(camera: GeospatialCamera): ModeLimitState {
    const existing = cameraStates.get(camera);
    if (existing) return existing;

    const radiusDescriptor = findDescriptor(camera, "radius");
    const yawDescriptor = findDescriptor(camera, "yaw");

    const initialLimits = camera.limits && typeof camera.limits === "object"
        ? camera.limits
        : fallbackLimits();

    const state: ModeLimitState = {
        limits: initialLimits,
        radiusDescriptor,
        yawDescriptor,
        radiusValue: readInitial(camera, radiusDescriptor, "radius"),
        yawValue: readInitial(camera, yawDescriptor, "yaw"),
        wrappedRadius: false,
        wrappedYaw: false,
    };

    cameraStates.set(camera, state);

    state.wrappedRadius = installProperty(camera, state, "radius");
    state.wrappedYaw = installProperty(camera, state, "yaw");

    return state;
}

function setCameraLimitsObject(camera: GeospatialCamera, limits: GeospatialLimits): void {
    let assigned = false;

    try {
        camera.limits = limits;
        assigned = true;
    } catch {
        // fall through
    }

    if (!assigned || camera.limits !== limits) {
        try {
            Object.defineProperty(camera, "limits", {
                configurable: true,
                enumerable: true,
                writable: true,
                value: limits,
            });
        } catch {
            // Best effort only. If the runtime camera object will not accept a new
            // limits object, the wrapper above still clours writes using the state copy.
        }
    }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
    if (!camera || typeof camera !== "object") return;

    const activeLimits = limits && typeof limits === "object"
        ? limits
        : fallbackLimits();

    const state = ensureState(camera);

    // The per-camera wrapper now uses this mode's limits.
    state.limits = activeLimits;

    // Make camera.limits report the mode's values as best the object allows.
    setCameraLimitsObject(camera, activeLimits);

    // Bring the current pose into the new mode's ranges.
    const rawRadius = readRaw(camera, state, "radius");
    const rawYaw = readRaw(camera, state, "yaw");

    const clampedRadius = clampRadius(activeLimits, rawRadius, rawRadius);
    const clampedYaw = clampYaw(activeLimits, rawYaw, rawYaw);

    try {
        camera.radius = clampedRadius;
    } catch {
        // Best effort.
    }

    try {
        camera.yaw = clampedYaw;
    } catch {
        // Best effort.
    }

    // Note 37 says a limits change applies on the next yaw/pitch/radius write that
    // changes the value, or on any center assignment.  Writing the same center object
    // forces that apply even if the pose already looked unchanged.
    try {
        if (camera.center) {
            camera.center = camera.center;
        }
    } catch {
        // Best effort.
    }
}
