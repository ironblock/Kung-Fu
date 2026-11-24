import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

type OrientationSetter = GeospatialCamera['_setOrientation'];
type OrientationCenter = Parameters<OrientationSetter>[3];

interface NumberAccessors {
  get?: () => number;
  set?: (value: number) => void;
  backing?: number;
  nativeSet?: boolean;
}

interface ModeLimitsState {
  limits: GeospatialLimits;
  applying: boolean;
  radius: NumberAccessors;
  yaw: NumberAccessors;
  originalSetOrientation: OrientationSetter;
}

const stateByCamera = new WeakMap<GeospatialCamera, ModeLimitsState>();

const PI = Math.PI;
const TWO_PI = PI * 2;
const YAW_EPS = 1e-6;

function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
  let current: object | null = target;
  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) return descriptor;
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeYaw(value: number): number {
  if (!Number.isFinite(value)) return 0;

  let y = value % TWO_PI;
  if (y < -PI) y += TWO_PI;
  if (y >= PI) y -= TWO_PI;
  if (Object.is(y, -0)) y = 0;

  return y;
}

function angleDifference(a: number, b: number): number {
  return Math.abs(normalizeYaw(a - b));
}

function safeYawBoundary(value: number): number {
  // The camera wraps yaw to [-PI, PI), so storing exactly PI would read back
  // as -PI. When a limit is effectively PI, keep the value just below PI.
  if (value >= PI - YAW_EPS) return PI - YAW_EPS;
  return value;
}

function equivalentInRange(y: number, min: number, max: number): number | null {
  const plus = y + TWO_PI;
  if (plus >= min && plus <= max) return plus;

  const minus = y - TWO_PI;
  if (minus >= min && minus <= max) return minus;

  return null;
}

function clampYaw(value: number, limits: GeospatialLimits, fallback: number): number {
  let min = finite(Number(limits.yawMin), -PI);
  let max = finite(Number(limits.yawMax), PI);

  if (min < -PI) min = -PI;
  if (max < -PI) max = -PI;
  if (min >= PI - YAW_EPS) min = PI - YAW_EPS;
  if (max >= PI - YAW_EPS) max = PI - YAW_EPS;

  const raw = finite(value, fallback);
  const y = normalizeYaw(raw);

  const full = min <= -PI && max >= PI - YAW_EPS;
  if (full) return y;

  if (min > max) {
    const fullWrap = min >= PI - YAW_EPS && max <= -PI;
    if (fullWrap) return y;

    if (y >= min || y <= max) return safeYawBoundary(y);

    const distMin = angleDifference(y, min);
    const distMax = angleDifference(y, max);
    return safeYawBoundary(distMin <= distMax ? min : max);
  }

  // Handle values that are effectively the PI boundary while the allowed range
  // includes PI, before the normalised value would become -PI.
  if (max >= PI - YAW_EPS && raw >= PI - YAW_EPS) return max;
  if (max >= PI - YAW_EPS && min <= 0 && raw <= -PI + YAW_EPS) return max;

  if (y >= min && y <= max) return safeYawBoundary(y);

  const equivalent = equivalentInRange(y, min, max);
  if (equivalent !== null) return safeYawBoundary(equivalent);

  if (y < min) return safeYawBoundary(min);
  if (y > max) return safeYawBoundary(max);

  return safeYawBoundary(y);
}

function clampRadius(value: number, limits: GeospatialLimits, fallback: number): number {
  let min = finite(Number(limits.radiusMin), 0);
  let max = finite(Number(limits.radiusMax), Number.POSITIVE_INFINITY);

  if (min > max) {
    const swap = min;
    min = max;
    max = swap;
  }

  let r = finite(value, fallback);
  if (!Number.isFinite(r)) r = min;

  if (r < min) return min;
  if (r > max) return max;
  return r;
}

function createNumberAccessors(cam: any, key: string): NumberAccessors {
  const descriptor = findDescriptor(cam, key);
  const acc: NumberAccessors = {};

  acc.nativeSet = Boolean(descriptor && typeof descriptor.set === "function");

  if (descriptor && typeof descriptor.get === "function") acc.get = descriptor.get.bind(cam);
  if (descriptor && typeof descriptor.set === "function") acc.set = descriptor.set.bind(cam);

  let initial = Number(cam[key]);
  if (!Number.isFinite(initial)) initial = 0;
  acc.backing = initial;

  if (!acc.set) {
    acc.set = (value: number) => { acc.backing = value; };
    acc.get = () => acc.backing ?? 0;
  } else if (!acc.get) {
    acc.get = () => acc.backing ?? 0;
  }

  return acc;
}

function syncPlainBacking(state: ModeLimitsState, yaw: number, radius: number): void {
  if (!state.yaw.nativeSet) state.yaw.backing = yaw;
  if (!state.radius.nativeSet) state.radius.backing = radius;
}

function patchNumberProperty(cam: any, key: "radius" | "yaw", state: ModeLimitsState): void {
  const acc = key === "radius" ? state.radius : state.yaw;
  const getter = acc.get ?? (() => acc.backing ?? 0);
  const setter = acc.set ?? ((value: number) => { acc.backing = value; });
  const nativeSet = Boolean(acc.nativeSet);

  Object.defineProperty(cam, key, {
    configurable: true,
    enumerable: false,
    get() {
      return getter.call(cam);
    },
    set(value: number) {
      const raw = Number(value);

      if (state.applying) {
        setter.call(cam, raw);
        return;
      }

      const fallback = getter.call(cam);
      const clamped = key === "radius"
        ? clampRadius(raw, state.limits, fallback)
        : clampYaw(raw, state.limits, fallback);

      state.applying = true;
      try {
        setter.call(cam, clamped);

        // If the property was a plain data field rather than an accessor, the
        // library normally updates the camera through _setOrientation.
        if (!nativeSet) {
          const pitch = Number(cam.pitch);
          const other = key === "radius" ? Number(cam.yaw) : Number(cam.radius);
          state.originalSetOrientation(clamped, pitch, other, cam.center);
        }
      } finally {
        state.applying = false;
      }
    }
  });
}

function patchSetOrientation(cam: any, state: ModeLimitsState): void {
  const initial = cam._setOrientation;
  let original: OrientationSetter = typeof initial === "function"
    ? (initial as OrientationSetter).bind(cam)
    : function (_yaw: number, _pitch: number, _radius: number, _center: OrientationCenter) {};

  state.originalSetOrientation = original;

  const wrapped = function (yaw: number, pitch: number, radius: number, center: OrientationCenter): void {
    if (state.applying) {
      syncPlainBacking(state, Number(yaw), Number(radius));
      original(yaw, pitch, radius, center);
      return;
    }

    const yawFallback = Number(cam.yaw);
    const radiusFallback = Number(cam.radius);
    const clampedYaw = clampYaw(Number(yaw), state.limits, yawFallback);
    const clampedRadius = clampRadius(Number(radius), state.limits, radiusFallback);

    syncPlainBacking(state, clampedYaw, clampedRadius);
    state.applying = true;
    try {
      original(clampedYaw, pitch, clampedRadius, center);
    } finally {
      state.applying = false;
    }
  };

  Object.defineProperty(cam, "_setOrientation", {
    configurable: true,
    enumerable: false,
    get() {
      return wrapped;
    },
    set(fn: OrientationSetter) {
      original = typeof fn === "function"
        ? fn.bind(cam)
        : function (_yaw: number, _pitch: number, _radius: number, _center: OrientationCenter) {};
      state.originalSetOrientation = original;
    }
  });
}

function publishLimits(cam: any, state: ModeLimitsState): void {
  try {
    cam.limits = state.limits;
  } catch {
    // ignore and fall back to a getter below.
  }

  if (cam.limits !== state.limits) {
    try {
      Object.defineProperty(cam, "limits", {
        configurable: true,
        enumerable: true,
        get() {
          return state.limits;
        },
        set(value: GeospatialLimits) {
          if (value) state.limits = value;
        }
      });
    } catch {
      // last-resort: we have already stored the current limits in state.
    }
  }
}

function enforceCurrent(cam: any, state: ModeLimitsState): void {
  const currentRadius = Number(cam.radius);
  const currentYaw = Number(cam.yaw);
  const currentPitch = Number(cam.pitch);
  const currentCenter = cam.center;

  const radius = clampRadius(currentRadius, state.limits, currentRadius);
  const yaw = clampYaw(currentYaw, state.limits, currentYaw);

  state.applying = true;
  try {
    syncPlainBacking(state, yaw, radius);

    cam.radius = radius;
    cam.yaw = yaw;

    const setOrientation = cam._setOrientation;
    if (typeof setOrientation === "function") {
      setOrientation(yaw, currentPitch, radius, currentCenter);
    } else {
      try {
        cam.center = currentCenter;
      } catch {
        // ignore; property assignment may be read-only in an unusual host.
      }
    }
  } finally {
    state.applying = false;
  }
}

export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  const cam = camera as any;
  let state = stateByCamera.get(camera);

  if (!state) {
    state = {
      limits,
      applying: false,
      radius: createNumberAccessors(cam, "radius"),
      yaw: createNumberAccessors(cam, "yaw"),
      originalSetOrientation: function (_yaw: number, _pitch: number, _radius: number, _center: OrientationCenter) {}
    };
    stateByCamera.set(camera, state);

    patchSetOrientation(cam, state);
    patchNumberProperty(cam, "radius", state);
    patchNumberProperty(cam, "yaw", state);
  } else {
    state.limits = limits;
  }

  publishLimits(cam, state);
  enforceCurrent(cam, state);
}
