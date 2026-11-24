import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

interface ModeLimitsState {
  radius: number;
  yaw: number;
  activeLimits: GeospatialLimits;
  installed: boolean;
  setOrientationWrapped: boolean;
}

const states = new WeakMap<GeospatialCamera, ModeLimitsState>();
const TWO_PI = Math.PI * 2;
const EPS = 1e-12;

function modPeriod(value: number, period: number): number {
  const r = value % period;
  return r < 0 ? r + period : r;
}

function normalizeToPi(angle: number): number {
  let t = ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  if (t <= -Math.PI + EPS) {
    t += TWO_PI;
  }
  return t;
}

function standardizeYawResult(angle: number, min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return angle;
  }

  if (min >= -Math.PI - EPS && max <= Math.PI + EPS) {
    if (angle > Math.PI + EPS || angle < -Math.PI - EPS) {
      return normalizeToPi(angle);
    }
  }

  return angle;
}

function clampRadius(limits: GeospatialLimits, value: number): number {
  let min = limits.radiusMin;
  let max = limits.radiusMax;

  if (!Number.isFinite(min) && !Number.isFinite(max)) {
    return value;
  }

  if (!Number.isFinite(min)) {
    min = -Infinity;
  }
  if (!Number.isFinite(max)) {
    max = Infinity;
  }

  if (min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }

  if (!Number.isFinite(value)) {
    return Number.isFinite(min) ? min : max;
  }

  return Math.min(Math.max(value, min), max);
}

function clampYaw(limits: GeospatialLimits, value: number): number {
  const min = limits.yawMin;
  const max = limits.yawMax;

  if (!Number.isFinite(min) && !Number.isFinite(max)) {
    return value;
  }

  if (!Number.isFinite(min)) {
    return value <= max ? value : max;
  }

  if (!Number.isFinite(max)) {
    return value >= min ? value : min;
  }

  if (!Number.isFinite(value)) {
    return min;
  }

  const rawSpan = max - min;
  if (rawSpan >= TWO_PI - EPS) {
    return standardizeYawResult(value, min, max);
  }

  const span = modPeriod(rawSpan, TWO_PI);
  if (span < EPS) {
    if (Math.abs(rawSpan) >= TWO_PI - EPS) {
      return standardizeYawResult(value, min, max);
    }
    return min;
  }
  if (span >= TWO_PI - EPS) {
    return standardizeYawResult(value, min, max);
  }

  let end = max;
  if (end < min - EPS) {
    const cycles = Math.ceil((min - end) / TWO_PI);
    end += cycles * TWO_PI;
  } else if (end >= min + TWO_PI - EPS) {
    const cycles = Math.floor((end - min) / TWO_PI);
    end -= cycles * TWO_PI;
  }

  const normalized = modPeriod(value - min, TWO_PI) + min;

  let result: number;
  if (normalized <= end + EPS) {
    result = normalized;
  } else {
    const distanceToEnd = normalized - end;
    const distanceToMin = min + TWO_PI - normalized;
    result = distanceToEnd <= distanceToMin ? max : min;
  }

  return standardizeYawResult(result, min, max);
}

function applyLimits(camera: GeospatialCamera, state: ModeLimitsState, limits: GeospatialLimits): void {
  state.activeLimits = limits;
  camera.radius = state.radius;
  camera.yaw = state.yaw;
}

function install(camera: GeospatialCamera, state: ModeLimitsState): void {
  if (state.installed) {
    return;
  }
  state.installed = true;

  Object.defineProperty(camera, "radius", {
    configurable: true,
    enumerable: true,
    get: () => state.radius,
    set: (value: number) => {
      state.radius = clampRadius(state.activeLimits, value);
    },
  });

  Object.defineProperty(camera, "yaw", {
    configurable: true,
    enumerable: true,
    get: () => state.yaw,
    set: (value: number) => {
      state.yaw = clampYaw(state.activeLimits, value);
    },
  });

  Object.defineProperty(camera, "limits", {
    configurable: true,
    enumerable: true,
    get: () => state.activeLimits,
    set: (value: GeospatialLimits) => {
      applyLimits(camera, state, value);
    },
  });

  const originalSetOrientation = camera._setOrientation;
  if (typeof originalSetOrientation === "function" && !state.setOrientationWrapped) {
    state.setOrientationWrapped = true;
    camera._setOrientation = (yaw: number, pitch: number, radius: number, center: GeospatialCamera["center"]) => {
      originalSetOrientation.call(
        camera,
        clampYaw(state.activeLimits, yaw),
        pitch,
        clampRadius(state.activeLimits, radius),
        center
      );
    };
  }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  let state = states.get(camera);
  if (!state) {
    state = {
      radius: camera.radius,
      yaw: camera.yaw,
      activeLimits: limits,
      installed: false,
      setOrientationWrapped: false,
    };
    states.set(camera, state);
  }

  install(camera, state);
  applyLimits(camera, state, limits);
}
