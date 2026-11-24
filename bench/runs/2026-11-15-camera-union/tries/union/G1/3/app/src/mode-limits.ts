import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera record. The write interceptors read `limits` at every write,
 * so switching mode only has to replace this field.
 */
interface ModeState {
  limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeState>();

function clampTo(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function boundRadius(value: number, limits: GeospatialLimits): number {
  return clampTo(value, limits.radiusMin, limits.radiusMax);
}

function boundYaw(value: number, limits: GeospatialLimits): number {
  return clampTo(value, limits.yawMin, limits.yawMax);
}

/** Finds a property descriptor on the object or its prototype chain. */
function findDescriptor(target: object, key: string): PropertyDescriptor | undefined {
  for (let o: object | null = target; o; o = Object.getPrototypeOf(o)) {
    const d = Object.getOwnPropertyDescriptor(o, key);
    if (d) return d;
  }
  return undefined;
}

type ClampedKey = "radius" | "yaw";

/**
 * Replaces `camera[key]` with an accessor on the instance. Writes are clamped
 * to the current mode's range, then passed to the original accessor (or stored
 * here if the original was a plain data field).
 */
function interceptKey(camera: GeospatialCamera, key: ClampedKey, state: ModeState): void {
  const found = findDescriptor(camera, key);
  const getOrig = found?.get;
  const setOrig = found?.set;
  let stored: number = camera[key];

  const bound = (value: number): number =>
    key === "radius" ? boundRadius(value, state.limits) : boundYaw(value, state.limits);

  Object.defineProperty(camera, key, {
    configurable: true,
    enumerable: true,
    get: () => (getOrig ? getOrig.call(camera) : stored),
    set: (value: number) => {
      const bounded = bound(value);
      if (setOrig) {
        setOrig.call(camera, bounded);
      } else if (!getOrig) {
        stored = bounded;
      }
    },
  });
}

/**
 * Clamps the yaw and radius arguments of `_setOrientation`, which is the
 * path used by setGeospatialOrientation and fly-to style moves.
 */
function interceptOrientation(camera: GeospatialCamera, state: ModeState): void {
  const orig = camera._setOrientation;
  if (!orig) return;
  camera._setOrientation = (yaw, pitch, radius, center) => {
    orig.call(
      camera,
      boundYaw(yaw, state.limits),
      pitch,
      boundRadius(radius, state.limits),
      center,
    );
  };
}

/**
 * Makes `limits` the active zoom and heading ranges for `camera`.
 *
 * The first call installs the write clamps; later calls only swap the
 * limits they use. The `limits` object is read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  const existing = states.get(camera);
  if (existing) {
    existing.limits = limits;
  } else {
    const state: ModeState = { limits };
    states.set(camera, state);
    interceptKey(camera, "radius", state);
    interceptKey(camera, "yaw", state);
    interceptOrientation(camera, state);
  }

  camera.limits = limits;

  // Bring the current pose into the new ranges. Each write goes through the
  // clamping setter; the library applies a write when it changes the value.
  camera.radius = camera.radius;
  camera.yaw = camera.yaw;
}
