import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

/**
 * Per-camera state. The accessors installed on the camera read `state.limits`
 * at write time, so switching modes only has to swap the reference here.
 */
interface ModeLimitsState {
  limits: GeospatialLimits;
}

const states = new WeakMap<GeospatialCamera, ModeLimitsState>();

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function clampRadius(limits: GeospatialLimits, radius: number): number {
  return clamp(radius, limits.radiusMin, limits.radiusMax);
}

function clampYaw(limits: GeospatialLimits, yaw: number): number {
  return clamp(yaw, limits.yawMin, limits.yawMax);
}

/**
 * Replaces `radius` and `yaw` on the camera with accessors that clamp every
 * write to the limits currently held in `state`, and wraps `_setOrientation`
 * so orientation writes made through it are clamped as well.
 * Runs once per camera; later calls only change `state.limits`.
 */
function install(camera: GeospatialCamera, state: ModeLimitsState): void {
  let radius = camera.radius;
  let yaw = camera.yaw;

  Object.defineProperty(camera, "radius", {
    configurable: true,
    enumerable: true,
    get: () => radius,
    set: (value: number) => {
      if (!Number.isFinite(value)) return;
      radius = clampRadius(state.limits, value);
    },
  });

  Object.defineProperty(camera, "yaw", {
    configurable: true,
    enumerable: true,
    get: () => yaw,
    set: (value: number) => {
      if (!Number.isFinite(value)) return;
      yaw = clampYaw(state.limits, value);
    },
  });

  const originalSetOrientation = camera._setOrientation;
  camera._setOrientation = (
    newYaw: number,
    pitch: number,
    newRadius: number,
    center,
  ) => {
    originalSetOrientation.call(
      camera,
      clampYaw(state.limits, newYaw),
      pitch,
      clampRadius(state.limits, newRadius),
      center,
    );
  };
}

/**
 * Makes `limits` the active limits of `camera`: `camera.limits` reports them,
 * and every later write to `radius` or `yaw` is kept inside their ranges.
 * The current radius and yaw are clamped immediately. The limits object is
 * read, never modified.
 */
export function useModeLimits(
  camera: GeospatialCamera,
  limits: GeospatialLimits,
): void {
  let state = states.get(camera);
  if (state) {
    state.limits = limits;
  } else {
    state = { limits };
    install(camera, state);
    states.set(camera, state);
  }

  camera.limits = limits;
  // Re-assign through the accessors so the current values fit the new ranges.
  camera.radius = camera.radius;
  camera.yaw = camera.yaw;
}
