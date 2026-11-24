import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
const RANGE_EPSILON = 1e-9;

type NumberGetter = () => number;
type NumberSetter = (value: number) => void;
type LimitsSetter = (value: GeospatialLimits) => void;
type OrientationSetter = (yaw: number, pitch: number, radius: number, center: unknown) => void;

interface ModeState {
  limits: GeospatialLimits;

  radiusGetter?: NumberGetter;
  radiusSetter?: NumberSetter;
  radiusValue?: number;
  radiusInstalled: boolean;

  yawGetter?: NumberGetter;
  yawSetter?: NumberSetter;
  yawValue?: number;
  yawInstalled: boolean;

  limitsSetter?: LimitsSetter;
  limitsInstalled: boolean;

  orientationOriginal?: OrientationSetter;
  orientationInstalled: boolean;

  applying: boolean;
}

const modeStates = new WeakMap<GeospatialCamera, ModeState>();

function normalizeRadians(angle: number): number {
  if (!Number.isFinite(angle)) return 0;

  let a = angle % TWO_PI;
  if (a > Math.PI) a -= TWO_PI;
  else if (a < -Math.PI) a += TWO_PI;

  return a;
}

function angularDistance(a: number, b: number): number {
  const d = Math.abs(normalizeRadians(a - b));
  return d > Math.PI ? TWO_PI - d : d;
}

function clampRadius(value: number, limits: GeospatialLimits): number {
  let min = Number(limits.radiusMin);
  let max = Number(limits.radiusMax);

  if (!Number.isFinite(min)) min = -Infinity;
  if (!Number.isFinite(max)) max = Infinity;

  if (min > max) {
    const t = min;
    min = max;
    max = t;
  }

  if (!Number.isFinite(value)) {
    return Number.isFinite(min) ? min : Number.isFinite(max) ? max : 0;
  }

  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function clampYaw(value: number, limits: GeospatialLimits): number {
  let min = Number(limits.yawMin);
  let max = Number(limits.yawMax);

  // If one side is infinite, treat the heading range as unrestricted modulo 2π.
  if (min === -Infinity || max === Infinity) return normalizeRadians(value);

  if (!Number.isFinite(min)) min = -Math.PI;
  if (!Number.isFinite(max)) max = Math.PI;

  const rawSpan = max - min;
  if (Number.isFinite(rawSpan) && rawSpan >= TWO_PI - RANGE_EPSILON) {
    return normalizeRadians(value);
  }

  min = normalizeRadians(min);
  max = normalizeRadians(max);

  const v = Number.isFinite(value) ? normalizeRadians(value) : min;

  if (Math.abs(max - min) < RANGE_EPSILON) return min;

  // Ordinary non-wrapping range.
  if (min <= max) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }

  // Wrapping range: allowed interval is [min, π] ∪ [-π, max].
  if (v >= min || v <= max) return v;

  const dMin = angularDistance(v, min);
  const dMax = angularDistance(v, max);
  return dMin <= dMax ? min : max;
}

function findPropertyDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
  let current: object | null = obj;

  while (current) {
    const desc = Object.getOwnPropertyDescriptor(current, key);
    if (desc) return desc;
    current = Object.getPrototypeOf(current) as object | null;
  }

  return undefined;
}

function tryDefine(obj: object, key: string, descriptor: PropertyDescriptor): boolean {
  try {
    Object.defineProperty(obj, key, descriptor);
    return true;
  } catch {
    return false;
  }
}

function readRadius(camera: GeospatialCamera, state: ModeState): number {
  if (state.radiusInstalled) {
    if (state.radiusValue !== undefined) return state.radiusValue;
    if (state.radiusGetter) return Number(state.radiusGetter.call(camera));
    return 0;
  }

  if (state.radiusGetter) return Number(state.radiusGetter.call(camera));
  return Number(camera.radius);
}

function readYaw(camera: GeospatialCamera, state: ModeState): number {
  if (state.yawInstalled) {
    if (state.yawValue !== undefined) return state.yawValue;
    if (state.yawGetter) return Number(state.yawGetter.call(camera));
    return 0;
  }

  if (state.yawGetter) return Number(state.yawGetter.call(camera));
  return Number(camera.yaw);
}

function writeRadius(camera: GeospatialCamera, state: ModeState, value: number): void {
  if (state.radiusInstalled) {
    if (state.radiusSetter) state.radiusSetter.call(camera, value);
    else state.radiusValue = value;
    return;
  }

  try {
    camera.radius = value;
  } catch {
    /* ignore */
  }
}

function writeYaw(camera: GeospatialCamera, state: ModeState, value: number): void {
  if (state.yawInstalled) {
    if (state.yawSetter) state.yawSetter.call(camera, value);
    else state.yawValue = value;
    return;
  }

  try {
    camera.yaw = value;
  } catch {
    /* ignore */
  }
}

function applyActiveLimits(camera: GeospatialCamera, state: ModeState): void {
  if (state.applying) return;

  state.applying = true;

  try {
    const radius = readRadius(camera, state);
    const yaw = readYaw(camera, state);

    const clampedRadius = clampRadius(radius, state.limits);
    const clampedYaw = clampYaw(yaw, state.limits);

    // If the camera exposes its internal orientation setter, use it so derived
    // state such as position/up/worldMatrix has a chance to update too.
    if (state.orientationOriginal) {
      try {
        state.orientationOriginal.call(
          camera,
          clampedYaw,
          Number(camera.pitch),
          clampedRadius,
          camera.center
        );
      } catch {
        /* ignore */
      }
    }

    writeYaw(camera, state, clampedYaw);
    writeRadius(camera, state, clampedRadius);
  } finally {
    state.applying = false;
  }
}

function installModeInterceptors(camera: GeospatialCamera, state: ModeState): void {
  const radiusDesc = findPropertyDescriptor(camera, "radius");
  const yawDesc = findPropertyDescriptor(camera, "yaw");
  const orientationDesc = findPropertyDescriptor(camera, "_setOrientation");
  const limitsDesc = findPropertyDescriptor(camera, "limits");

  // radius
  if (radiusDesc?.get && radiusDesc?.set) {
    state.radiusGetter = radiusDesc.get as NumberGetter;
    state.radiusSetter = radiusDesc.set as NumberSetter;
  } else {
    state.radiusValue = Number(camera.radius);
    if (radiusDesc?.get) state.radiusGetter = radiusDesc.get as NumberGetter;
    if (radiusDesc?.set) state.radiusSetter = radiusDesc.set as NumberSetter;
  }

  state.radiusInstalled = tryDefine(camera, "radius", {
    configurable: true,
    enumerable: radiusDesc?.enumerable ?? true,
    get: () => {
      let value = 0;
      if (state.radiusValue !== undefined) value = state.radiusValue;
      else if (state.radiusGetter) value = Number(state.radiusGetter.call(camera));

      return clampRadius(value, state.limits);
    },
    set: (value: number) => {
      const next = clampRadius(Number(value), state.limits);

      if (state.radiusSetter) state.radiusSetter.call(camera, next);
      else state.radiusValue = next;
    }
  });

  // yaw
  if (yawDesc?.get && yawDesc?.set) {
    state.yawGetter = yawDesc.get as NumberGetter;
    state.yawSetter = yawDesc.set as NumberSetter;
  } else {
    state.yawValue = Number(camera.yaw);
    if (yawDesc?.get) state.yawGetter = yawDesc.get as NumberGetter;
    if (yawDesc?.set) state.yawSetter = yawDesc.set as NumberSetter;
  }

  state.yawInstalled = tryDefine(camera, "yaw", {
    configurable: true,
    enumerable: yawDesc?.enumerable ?? true,
    get: () => {
      let value = 0;
      if (state.yawValue !== undefined) value = state.yawValue;
      else if (state.yawGetter) value = Number(state.yawGetter.call(camera));

      return clampYaw(value, state.limits);
    },
    set: (value: number) => {
      const next = clampYaw(Number(value), state.limits);

      if (state.yawSetter) state.yawSetter.call(camera, next);
      else state.yawValue = next;
    }
  });

  // _setOrientation, if present.  This helps cover app/library orientation writes
  // that go through the camera's internal orientation setter rather than direct
  // property assignment.
  const maybeOrientation = (orientationDesc?.value ?? camera._setOrientation) as unknown;
  if (typeof maybeOrientation === "function") {
    state.orientationOriginal = maybeOrientation as OrientationSetter;

    const wrapped = function (yaw: number, pitch: number, radius: number, center: unknown) {
      const clampedYaw = clampYaw(Number(yaw), state.limits);
      const clampedRadius = clampRadius(Number(radius), state.limits);

      const original = state.orientationOriginal;
      if (original) {
        try {
          original.call(camera, clampedYaw, Number(pitch), clampedRadius, center);
        } catch {
          /* ignore */
        }
      }

      // Keep storage-only overrides in sync when _setOrientation bypasses them.
      if (state.radiusValue !== undefined) state.radiusValue = clampedRadius;
      if (state.yawValue !== undefined) state.yawValue = clampedYaw;
    };

    state.orientationInstalled = tryDefine(camera, "_setOrientation", {
      configurable: true,
      enumerable: orientationDesc?.enumerable ?? false,
      writable: true,
      value: wrapped
    });

    if (!state.orientationInstalled) {
      try {
        camera._setOrientation = wrapped as unknown as GeospatialCamera["_setOrientation"];
        state.orientationInstalled = true;
      } catch {
        /* ignore */
      }
    }
  }

  // limits
  if (limitsDesc?.set) state.limitsSetter = limitsDesc.set as LimitsSetter;

  state.limitsInstalled = tryDefine(camera, "limits", {
    configurable: true,
    enumerable: limitsDesc?.enumerable ?? true,
    get: () => state.limits,
    set: (value: GeospatialLimits) => {
      if (!value || state.limits === value) return;

      state.limits = value;

      if (state.limitsSetter) {
        try {
          state.limitsSetter.call(camera, value);
        } catch {
          /* ignore */
        }
      }

      applyActiveLimits(camera, state);
    }
  });

  if (!state.limitsInstalled) {
    try {
      camera.limits = state.limits;
    } catch {
      /* ignore */
    }
  } else if (state.limitsSetter) {
    try {
      state.limitsSetter.call(camera, state.limits);
    } catch {
      /* ignore */
    }
  }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  if (!camera || !limits) return;

  let state = modeStates.get(camera);

  if (!state) {
    state = {
      limits,
      radiusInstalled: false,
      yawInstalled: false,
      limitsInstalled: false,
      orientationInstalled: false,
      applying: false
    };

    modeStates.set(camera, state);
    installModeInterceptors(camera, state);
    applyActiveLimits(camera, state);
    return;
  }

  const changed = state.limits !== limits;
  state.limits = limits;

  if (changed && state.limitsInstalled && state.limitsSetter) {
    try {
      state.limitsSetter.call(camera, limits);
    } catch {
      /* ignore */
    }
  }

  if (!state.limitsInstalled) {
    try {
      camera.limits = limits;
    } catch {
      /* ignore */
    }
  }

  applyActiveLimits(camera, state);
}
