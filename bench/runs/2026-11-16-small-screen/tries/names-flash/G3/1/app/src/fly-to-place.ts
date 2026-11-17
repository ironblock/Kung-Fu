import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

type FlyOptions = Parameters<typeof flyGeospatialCameraToAsync>[2];
type FlyCenter = NonNullable<FlyOptions["center"]>;
type CenterLike = { x: number; y: number; z: number };

interface Target {
  yaw: number;
  pitch: number;
  radius: number;
  center: CenterLike;
}

interface FlightState {
  target: Target;
  cancelled: boolean;
  settled: boolean;
  resolveCancel?: (value: boolean) => void;
}

interface CancelFlyMeta {
  impl?: (() => void) | null;
  starting: boolean;
}

const states = new WeakMap<GeospatialCamera, FlightState>();
const interceptors = new WeakMap<GeospatialCamera, CancelFlyMeta | null>();

const TWO_PI = Math.PI * 2;
const ARRIVAL_EPSILON = 1e-3;

function isFiniteNumber(value: number): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle)) return angle;

  let normalized = angle % TWO_PI;
  if (normalized > Math.PI) normalized -= TWO_PI;
  else if (normalized < -Math.PI) normalized += TWO_PI;

  return normalized;
}

function validatePlace(place: Place): boolean {
  const center = place.center as CenterLike | undefined;

  return (
    !!center &&
    isFiniteNumber(place.yaw) &&
    isFiniteNumber(place.pitch) &&
    isFiniteNumber(place.radius) &&
    isFiniteNumber(center.x) &&
    isFiniteNumber(center.y) &&
    isFiniteNumber(center.z)
  );
}

function normalizeTarget(place: Place): Target {
  const center = place.center as CenterLike;

  return {
    yaw: normalizeAngle(place.yaw),
    pitch: place.pitch,
    radius: place.radius,
    center: {
      x: center.x,
      y: center.y,
      z: center.z,
    },
  };
}

function finiteCoord(value: CenterLike | undefined, key: "x" | "y" | "z"): number {
  if (!value) return Number.NaN;

  try {
    const raw = value[key];
    return Number.isFinite(raw) ? raw : Number.NaN;
  } catch {
    return Number.NaN;
  }
}

function vectorDistance(a: CenterLike | undefined, b: CenterLike | undefined): number {
  const dx = finiteCoord(a, "x") - finiteCoord(b, "x");
  const dy = finiteCoord(a, "y") - finiteCoord(b, "y");
  const dz = finiteCoord(a, "z") - finiteCoord(b, "z");

  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
    return Number.POSITIVE_INFINITY;
  }

  if (typeof Math.hypot === "function") {
    const distance = Math.hypot(dx, dy, dz);
    return Number.isFinite(distance) ? distance : Number.POSITIVE_INFINITY;
  }

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return Number.isFinite(distance) ? distance : Number.POSITIVE_INFINITY;
}

function getScale(camera: GeospatialCamera, target: Target): number {
  const limits = camera.limits as { planetRadius?: number; radiusMax?: number } | undefined;

  const planetRadius = limits && Number.isFinite(limits.planetRadius) ? limits.planetRadius : 1;
  const radiusMax = limits && Number.isFinite(limits.radiusMax) ? limits.radiusMax : 1;
  const radius = Number.isFinite(camera.radius) ? camera.radius : 1;
  const targetRadius = Number.isFinite(target.radius) ? target.radius : 1;

  return Math.max(
    1,
    Math.abs(planetRadius),
    Math.abs(radiusMax),
    Math.abs(radius),
    Math.abs(targetRadius)
  );
}

function isAtTarget(camera: GeospatialCamera, target: Target): boolean {
  if (!camera || !target) return false;

  if (
    !isFiniteNumber(camera.yaw) ||
    !isFiniteNumber(camera.pitch) ||
    !isFiniteNumber(camera.radius)
  ) {
    return false;
  }

  if (
    !isFiniteNumber(target.yaw) ||
    !isFiniteNumber(target.pitch) ||
    !isFiniteNumber(target.radius)
  ) {
    return false;
  }

  const yawDelta = Math.abs(normalizeAngle(camera.yaw - target.yaw));
  const pitchDelta = Math.abs(camera.pitch - target.pitch);
  const radiusDelta = Math.abs(camera.radius - target.radius);
  const centerDelta = vectorDistance(camera.center as CenterLike | undefined, target.center);

  const scale = getScale(camera, target);
  const angularTolerance = ARRIVAL_EPSILON;
  const linearTolerance = ARRIVAL_EPSILON * Math.max(1, scale * 1e-6);

  return (
    yawDelta <= angularTolerance &&
    pitchDelta <= angularTolerance &&
    radiusDelta <= linearTolerance &&
    centerDelta <= linearTolerance
  );
}

function abortState(state: FlightState): void {
  if (state.cancelled || state.settled) return;

  state.cancelled = true;
  state.resolveCancel?.(false);
}

function makeCancelPromise(state: FlightState): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    state.resolveCancel = resolve;

    if (state.cancelled) {
      resolve(false);
    }
  });
}

function finishState(camera: GeospatialCamera, state: FlightState): void {
  state.settled = true;

  if (states.get(camera) === state) {
    states.delete(camera);
  }
}

function ensureCancelFlyInterceptor(camera: GeospatialCamera): CancelFlyMeta | null {
  if (typeof camera !== "object" || camera === null) return null;

  const existing = interceptors.get(camera);
  if (existing !== undefined) return existing;

  const cameraAny = camera as any;

  let initialImpl: (() => void) | null | undefined;
  try {
    initialImpl = cameraAny._cancelFly;
  } catch {
    initialImpl = undefined;
  }

  const meta: CancelFlyMeta = {
    impl: initialImpl,
    starting: false,
  };

  try {
    const descriptor = Object.getOwnPropertyDescriptor(cameraAny, "_cancelFly");

    // If the property is already an accessor, replacing it could interfere with
    // library internals. In that case we fall back to ordinary cancellation.
    if (descriptor && (descriptor.get || descriptor.set)) {
      interceptors.set(camera, null);
      return null;
    }

    if (descriptor && !descriptor.configurable) {
      interceptors.set(camera, null);
      return null;
    }

    let wrapperActive = false;

    const wrapper = () => {
      if (wrapperActive) return;
      wrapperActive = true;

      try {
        const state = states.get(camera);

        if (
          !meta.starting &&
          state &&
          !state.cancelled &&
          !state.settled &&
          !isAtTarget(camera, state.target)
        ) {
          abortState(state);
        }
      } catch {
        // Do not let observation/cancellation bookkeeping break the underlying cancel.
      }

      const impl = meta.impl;

      if (
        typeof impl === "function" &&
        impl !== wrapper &&
        !(impl as any).__flyToPlaceCancelFlyWrapper
      ) {
        try {
          impl.call(camera);
        } catch {
          // Ignore errors thrown by the library’s cancel function.
        }
      }

      wrapperActive = false;
    };

    (wrapper as any).__flyToPlaceCancelFlyWrapper = true;

    Object.defineProperty(cameraAny, "_cancelFly", {
      configurable: descriptor ? descriptor.configurable : true,
      enumerable: descriptor ? descriptor.enumerable : false,
      get() {
        return meta.impl ? wrapper : undefined;
      },
      set(value) {
        const isWrapper =
          typeof value === "function" && !!(value as any).__flyToPlaceCancelFlyWrapper;

        if (isWrapper) {
          // Preserve the underlying raw implementation if we already have one.
          if (!meta.impl) {
            meta.impl = wrapper;
          }
        } else {
          meta.impl = value as (() => void) | null | undefined;
        }
      },
    });

    interceptors.set(camera, meta);
    return meta;
  } catch {
    interceptors.set(camera, null);
    return null;
  }
}

function stopCurrentFly(
  camera: GeospatialCamera,
  meta: CancelFlyMeta | null,
  clearState: boolean
): void {
  const previous = states.get(camera);

  if (previous && !previous.settled && !previous.cancelled) {
    abortState(previous);
  }

  if (meta) meta.starting = true;

  try {
    const cancel = (camera as any)._cancelFly;

    if (typeof cancel === "function") {
      cancel.call(camera);
    }
  } catch {
    // Ignore errors while attempting to stop the current animation.
  } finally {
    if (meta) meta.starting = false;
  }

  if (clearState) {
    states.delete(camera);
  }
}

function setOrientationToTarget(camera: GeospatialCamera, target: Target): boolean {
  try {
    const setter = camera._setOrientation;

    if (typeof setter === "function") {
      setter.call(
        camera,
        target.yaw,
        target.pitch,
        target.radius,
        target.center as unknown as Parameters<typeof setter>[3]
      );
    } else {
      camera.yaw = target.yaw;
      camera.pitch = target.pitch;
      camera.radius = target.radius;
      camera.center = target.center as unknown as typeof camera.center;
    }
  } catch {
    // If the library cannot apply the orientation, fall through to arrival check.
  }

  try {
    return isAtTarget(camera, target);
  } catch {
    return false;
  }
}

export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  if (!camera || !place || !place.center || !validatePlace(place)) {
    return Promise.resolve(false);
  }

  const meta = ensureCancelFlyInterceptor(camera);
  const target = normalizeTarget(place);
  const duration = isFiniteNumber(durationMs) ? Math.max(0, durationMs) : 0;

  if (!scene) {
    stopCurrentFly(camera, meta, true);
    return Promise.resolve(false);
  }

  if (duration <= 0) {
    stopCurrentFly(camera, meta, true);
    return Promise.resolve(setOrientationToTarget(camera, target));
  }

  stopCurrentFly(camera, meta, false);

  const state: FlightState = {
    target,
    cancelled: false,
    settled: false,
  };

  states.set(camera, state);

  if (meta) meta.starting = true;

  let flyPromise: Promise<void> | undefined;

  try {
    flyPromise = flyGeospatialCameraToAsync(camera, scene, {
      yaw: target.yaw,
      pitch: target.pitch,
      radius: target.radius,
      center: target.center as unknown as FlyOptions["center"],
      durationMs: duration,
    });
  } catch {
    flyPromise = undefined;
  } finally {
    if (meta) meta.starting = false;
  }

  const maybeFly = flyPromise as unknown;

  if (!maybeFly || typeof (maybeFly as any).then !== "function") {
    const result = state.cancelled ? false : setOrientationToTarget(camera, target);
    finishState(camera, state);
    return Promise.resolve(result);
  }

  const activeFlyPromise = maybeFly as Promise<void>;
  const cancelPromise = makeCancelPromise(state);

  const completionPromise = (async () => {
    try {
      await activeFlyPromise;
    } catch {
      // Never reject from flyToPlace.
    }

    if (state.cancelled || state.settled) {
      return false;
    }

    state.settled = true;

    try {
      return isAtTarget(camera, target);
    } catch {
      return false;
    }
  })();

  let result = false;

  try {
    result = await Promise.race([completionPromise, cancelPromise]);
  } catch {
    result = false;
  }

  finishState(camera, state);
  return result;
}
