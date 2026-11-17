import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type OrientationArgs = readonly [number, number, number, unknown];

interface ModeState {
  limits: GeospatialLimits;
  radiusInstalled: boolean;
  yawInstalled: boolean;
  limitsInstalled: boolean;
  applyingOrientation: boolean;
}

const modeStates = new WeakMap<GeospatialCamera, ModeState>();
const TWO_PI = Math.PI * 2;

function normalizeRadians(angle: number): number {
  if (!Number.isFinite(angle)) return angle;

  let wrapped = angle % TWO_PI;
  if (wrapped > Math.PI) wrapped -= TWO_PI;
  else if (wrapped < -Math.PI) wrapped += TWO_PI;
  return wrapped;
}

function normalizeTo(angle: number, origin: number): number {
  if (!Number.isFinite(angle)) return angle;
  if (!Number.isFinite(origin)) return normalizeRadians(angle);

  let wrapped = (angle - origin) % TWO_PI;
  if (wrapped < 0) wrapped += TWO_PI;
  return origin + wrapped;
}

function clampRadius(value: number, limits: GeospatialLimits, current: number): number {
  let min = limits.radiusMin;
  let max = limits.radiusMax;

  if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
    const swap = min;
    min = max;
    max = swap;
  }

  if (Number.isNaN(value)) {
    return Number.isFinite(current) ? clampRadius(current, limits, current) : 0;
  }

  if (!Number.isFinite(value)) {
    if (Number.isFinite(min) && Number.isFinite(max)) return value > 0 ? max : min;
    if (Number.isFinite(min)) return min;
    if (Number.isFinite(max)) return max;
    return Number.isFinite(current) ? current : 0;
  }

  if (Number.isFinite(min) && Number.isFinite(max)) {
    return Math.min(Math.max(value, min), max);
  }

  if (Number.isFinite(min)) return Math.max(value, min);
  if (Number.isFinite(max)) return Math.min(value, max);

  return value;
}

function clampYaw(value: number, limits: GeospatialLimits, current: number): number {
  const fallback = Number.isFinite(current) ? clampYaw(current, limits, current) : 0;

  if (Number.isNaN(value)) return fallback;

  const min = limits.yawMin;
  const max = limits.yawMax;

  if (Number.isFinite(min) && Number.isFinite(max)) {
    if (min <= max) {
      if (!Number.isFinite(value)) return value > 0 ? max : min;
      return Math.min(Math.max(value, min), max);
    }

    if (!Number.isFinite(value)) {
      const nMin = normalizeRadians(min);
      const nMax = normalizeRadians(max);
      if (nMin <= nMax) return value > 0 ? nMax : nMin;
      return value > 0 ? nMax : nMin;
    }

    const n = normalizeRadians(value);
    const nMin = normalizeRadians(min);
    const nMax = normalizeRadians(max);

    if (nMin <= nMax) {
      return Math.min(Math.max(n, nMin), nMax);
    }

    if (n >= nMin || n <= nMax) return n;

    const distToMin = nMin - n;
    const distToMax = n - nMax;
    return distToMin <= distToMax ? nMin : nMax;
  }

  if (!Number.isFinite(value)) {
    if (Number.isFinite(min)) return min;
    if (Number.isFinite(max)) return max;
    return fallback;
  }

  if (Number.isFinite(min)) return Math.max(value, min);
  if (Number.isFinite(max)) return Math.min(value, max);

  return normalizeRadians(value);
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

function installNumberProperty(
  camera: GeospatialCamera,
  state: ModeState,
  property: "radius" | "yaw",
  clampValue: (value: number, limits: GeospatialLimits, current: number) => number,
  makeOrientationArgs: (clamped: number, cam: any) => OrientationArgs
): boolean {
  const cam = camera as any;
  const descriptor = findDescriptor(cam, property);

  const originalGet = descriptor?.get as (() => number) | undefined;
  const originalSet = descriptor?.set as ((value: number) => void) | undefined;

  // If there is both a getter and a setter, preserve the original getter so the
  // library's own backing fields stay authoritative. Otherwise, use our backing
  // value so plain mutable properties and getter-only properties can still be
  // safely replaced.
  const useOriginalGetter = !!originalGet && !!originalSet;

  let backing = typeof cam[property] === "number" ? cam[property] : 0;
  let applyingProperty = false;

  try {
    Object.defineProperty(cam, property, {
      configurable: true,
      enumerable: descriptor?.enumerable ?? false,

      get(): number {
        if (useOriginalGetter && originalGet) return originalGet.call(cam);
        return backing;
      },

      set(value: number): void {
        if (applyingProperty || state.applyingOrientation) {
          if (!useOriginalGetter) backing = value;
          return;
        }

        const current = useOriginalGetter && originalGet ? originalGet.call(cam) : backing;
        const clamped = clampValue(value, state.limits, current);

        applyingProperty = true;
        try {
          if (originalSet) {
            if (!useOriginalGetter) backing = clamped;
            originalSet.call(cam, clamped);
          } else if (originalGet && typeof cam._setOrientation === "function") {
            backing = clamped;
            state.applyingOrientation = true;

            try {
              const args = makeOrientationArgs(clamped, cam);
              cam._setOrientation(args[0], args[1], args[2], args[3]);
            } catch {
              // Ignore internal orientation-update failures; the property setter
              // has already stored the clamped value in `backing`.
            } finally {
              state.applyingOrientation = false;
            }
          } else {
            backing = clamped;
          }
        } finally {
          applyingProperty = false;
        }
      }
    });

    return true;
  } catch {
    return false;
  }
}

function installLimits(camera: GeospatialCamera, state: ModeState): boolean {
  const cam = camera as any;
  const descriptor = findDescriptor(cam, "limits");
  const originalSet = descriptor?.set as ((value: GeospatialLimits) => void) | undefined;

  let applyingLimits = false;

  try {
    Object.defineProperty(cam, "limits", {
      configurable: true,
      enumerable: descriptor?.enumerable ?? false,

      get(): GeospatialLimits {
        return state.limits;
      },

      set(value: GeospatialLimits): void {
        if (applyingLimits) {
          state.limits = value;
          return;
        }

        applyingLimits = true;
        try {
          state.limits = value;
          if (originalSet) originalSet.call(cam, value);
        } finally {
          applyingLimits = false;
        }
      }
    });

    return true;
  } catch {
    return false;
  }
}

function ensureInstalled(camera: GeospatialCamera, state: ModeState): void {
  if (!state.radiusInstalled) {
    state.radiusInstalled = installNumberProperty(
      camera,
      state,
      "radius",
      clampRadius,
      (clamped: number, cam: any): OrientationArgs => [cam.yaw, cam.pitch, clamped, cam.center]
    );
  }

  if (!state.yawInstalled) {
    state.yawInstalled = installNumberProperty(
      camera,
      state,
      "yaw",
      clampYaw,
      (clamped: number, cam: any): OrientationArgs => [clamped, cam.pitch, cam.radius, cam.center]
    );
  }

  if (!state.limitsInstalled) {
    state.limitsInstalled = installLimits(camera, state);
  }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  let state = modeStates.get(camera);

  if (!state) {
    state = {
      limits,
      radiusInstalled: false,
      yawInstalled: false,
      limitsInstalled: false,
      applyingOrientation: false
    };
    modeStates.set(camera, state);
  } else {
    state.limits = limits;
  }

  ensureInstalled(camera, state);

  try {
    (camera as any).limits = limits;
  } catch {
    // If the camera's `limits` property cannot be written directly, the accessor
    // installed above (when available) keeps `camera.limits` reporting `state.limits`.
  }
}
