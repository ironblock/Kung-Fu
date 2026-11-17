import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeLimitsState {
  currentLimits: GeospatialLimits | undefined;
  radiusValue: number;
  yawValue: number;
  installed: boolean;
  applying: boolean;
  radiusDescriptor?: PropertyDescriptor;
  yawDescriptor?: PropertyDescriptor;
  limitsDescriptor?: PropertyDescriptor;
}

const states = new WeakMap<GeospatialCamera, ModeLimitsState>();
const TWO_PI = Math.PI * 2;
const EPSILON = 1e-6;

function findDescriptor(value: object, key: string): PropertyDescriptor | undefined {
  let current: object | null = value;
  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) {
      return descriptor;
    }
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

function normalizeRadians(angle: number): number {
  if (!Number.isFinite(angle)) {
    return 0;
  }

  let normalized = angle % TWO_PI;
  if (normalized < -Math.PI) {
    normalized += TWO_PI;
  } else if (normalized > Math.PI) {
    normalized -= TWO_PI;
  }
  return normalized;
}

function clampRadius(value: number, limits: GeospatialLimits | undefined): number {
  if (!limits) {
    return Number.isFinite(value) ? value : 0;
  }

  let min = limits.radiusMin;
  let max = limits.radiusMax;

  if (!Number.isFinite(min)) {
    min = 0;
  }
  if (!Number.isFinite(max)) {
    max = min;
  }
  if (min > max) {
    const swap = min;
    min = max;
    max = swap;
  }

  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function clampYaw(value: number, limits: GeospatialLimits | undefined): number {
  if (!limits) {
    return Number.isFinite(value) ? value : 0;
  }

  const minRaw = limits.yawMin;
  const maxRaw = limits.yawMax;

  if (!Number.isFinite(minRaw) || !Number.isFinite(maxRaw)) {
    return Number.isFinite(value) ? value : 0;
  }
  if (!Number.isFinite(value)) {
    return normalizeRadians(minRaw);
  }

  let span = maxRaw - minRaw;
  if (span < 0) {
    span += TWO_PI;
  }

  if (span >= TWO_PI - EPSILON) {
    return value;
  }
  if (span < EPSILON) {
    return normalizeRadians(minRaw);
  }

  const min = normalizeRadians(minRaw);
  const max = normalizeRadians(maxRaw);
  const v = normalizeRadians(value);

  let normalizedSpan = max - min;
  if (normalizedSpan < 0) {
    normalizedSpan += TWO_PI;
  }

  const offset = (v - min + TWO_PI) % TWO_PI;
  if (offset <= normalizedSpan + EPSILON) {
    return v;
  }

  const distanceToMax = offset - normalizedSpan;
  const distanceToMin = TWO_PI - offset;
  return distanceToMax <= distanceToMin ? max : min;
}

function applyLimits(camera: GeospatialCamera, state: ModeLimitsState, limits: GeospatialLimits): void {
  if (!limits || state.applying) {
    return;
  }

  state.applying = true;
  try {
    state.currentLimits = limits;

    const limitsDescriptor = state.limitsDescriptor;
    if (limitsDescriptor && limitsDescriptor.set) {
      limitsDescriptor.set.call(camera, limits);
    }

    camera.radius = camera.radius;
    camera.yaw = camera.yaw;

    const setOrientation = (camera as GeospatialCamera & {
      _setOrientation?: (yaw: number, pitch: number, radius: number, center: GeospatialCamera["center"]) => void;
    })._setOrientation;

    if (typeof setOrientation === "function") {
      try {
        setOrientation.call(camera, camera.yaw, camera.pitch, camera.radius, camera.center);
      } catch {
        // The accessors still enforce the limits even if the internal sync method fails.
      }
    }
  } finally {
    state.applying = false;
  }
}

function installAccessors(camera: GeospatialCamera, state: ModeLimitsState): void {
  if (state.installed) {
    return;
  }

  const radiusDescriptor = state.radiusDescriptor;
  Object.defineProperty(camera, "radius", {
    configurable: true,
    enumerable: radiusDescriptor ? radiusDescriptor.enumerable : true,
    get: () => {
      let value = state.radiusValue;
      if (radiusDescriptor && radiusDescriptor.get) {
        const original = radiusDescriptor.get.call(camera) as number;
        if (Number.isFinite(original)) {
          value = original;
        }
      }
      return clampRadius(value, state.currentLimits);
    },
    set: (value: number) => {
      const clamped = clampRadius(value, state.currentLimits);
      if (radiusDescriptor && radiusDescriptor.set) {
        radiusDescriptor.set.call(camera, clamped);
      } else {
        state.radiusValue = clamped;
      }
    },
  });

  const yawDescriptor = state.yawDescriptor;
  Object.defineProperty(camera, "yaw", {
    configurable: true,
    enumerable: yawDescriptor ? yawDescriptor.enumerable : true,
    get: () => {
      let value = state.yawValue;
      if (yawDescriptor && yawDescriptor.get) {
        const original = yawDescriptor.get.call(camera) as number;
        if (Number.isFinite(original)) {
          value = original;
        }
      }
      return clampYaw(value, state.currentLimits);
    },
    set: (value: number) => {
      const clamped = clampYaw(value, state.currentLimits);
      if (yawDescriptor && yawDescriptor.set) {
        yawDescriptor.set.call(camera, clamped);
      } else {
        state.yawValue = clamped;
      }
    },
  });

  const limitsDescriptor = state.limitsDescriptor;
  Object.defineProperty(camera, "limits", {
    configurable: true,
    enumerable: limitsDescriptor ? limitsDescriptor.enumerable : true,
    get: () => state.currentLimits,
    set: (value: GeospatialLimits) => {
      applyLimits(camera, state, value);
    },
  });

  state.installed = true;
}

function getState(camera: GeospatialCamera): ModeLimitsState {
  let state = states.get(camera);
  if (!state) {
    state = {
      currentLimits: camera.limits,
      radiusValue: camera.radius,
      yawValue: camera.yaw,
      installed: false,
      applying: false,
      radiusDescriptor: findDescriptor(camera, "radius"),
      yawDescriptor: findDescriptor(camera, "yaw"),
      limitsDescriptor: findDescriptor(camera, "limits"),
    };
    states.set(camera, state);
  }
  return state;
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  if (!camera || !limits) {
    return;
  }

  const state = getState(camera);
  installAccessors(camera, state);
  applyLimits(camera, state, limits);
}
