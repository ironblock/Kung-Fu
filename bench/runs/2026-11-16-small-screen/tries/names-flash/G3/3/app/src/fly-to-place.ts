import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

type CancelListener = () => void;

interface CameraFlyState {
  listeners: Set<CancelListener>;
  originalCancelFly?: () => void;
  wrappedCancelFly?: () => void;
  hooked: boolean;
  notifying: boolean;
}

const flyStates = new WeakMap<GeospatialCamera, CameraFlyState>();

/**
 * Wrap the optional, private `_cancelFly` hook so we can tell when the library
 * cancels an active fly-to. The wrapper is intentionally lightweight: it only
 * notifies flights started by this module, then calls the original cancel method.
 */
function makeCancelWrapper(camera: GeospatialCamera, state: CameraFlyState): CancelListener {
  return () => {
    if (state.notifying) return;
    state.notifying = true;

    try {
      const listeners = Array.from(state.listeners);
      for (const listener of listeners) listener();

      const original = state.originalCancelFly;
      if (typeof original === "function") original.call(camera);
    } finally {
      state.notifying = false;
    }
  };
}

function ensureCancelHook(camera: GeospatialCamera): CameraFlyState {
  let state = flyStates.get(camera);

  if (!state) {
    state = {
      listeners: new Set(),
      hooked: false,
      notifying: false,
    };
    flyStates.set(camera, state);
  }

  if (state.hooked) return state;

  const original = camera._cancelFly;
  state.originalCancelFly = typeof original === "function" ? original : undefined;
  state.wrappedCancelFly = makeCancelWrapper(camera, state);

  try {
    const hookTarget = camera as unknown as Record<string, unknown>;

    Object.defineProperty(hookTarget, "_cancelFly", {
      configurable: true,
      enumerable: false,
      get() {
        return typeof state.originalCancelFly === "function" ? state.wrappedCancelFly : undefined;
      },
      set(value: unknown) {
        if (value === state.wrappedCancelFly) return;
        state.originalCancelFly = typeof value === "function" ? (value as () => void) : undefined;
      },
    });

    state.hooked = true;
  } catch {
    // If the property cannot be intercepted (for example, a frozen or sealed
    // mock), fall back to wrapping it only if it is already a function.
    if (typeof camera._cancelFly === "function") {
      const originalFn = camera._cancelFly;

      camera._cancelFly = () => {
        if (state.notifying) return;
        state.notifying = true;

        try {
          const listeners = Array.from(state.listeners);
          for (const listener of listeners) listener();
          originalFn.call(camera);
        } finally {
          state.notifying = false;
        }
      };

      state.wrappedCancelFly = camera._cancelFly;
      state.hooked = true;
    }
  }

  return state;
}

function notifyActiveFlights(state: CameraFlyState): void {
  if (state.notifying) return;
  state.notifying = true;

  try {
    const listeners = Array.from(state.listeners);
    for (const listener of listeners) listener();
  } finally {
    state.notifying = false;
  }
}

function wrapAngle(angle: number): number {
  const tau = Math.PI * 2;
  let wrapped = angle % tau;

  if (wrapped > Math.PI) wrapped -= tau;
  if (wrapped < -Math.PI) wrapped += tau;

  return wrapped;
}

function cameraArrived(camera: GeospatialCamera, place: Place): boolean {
  if (!camera || !place || !place.center) return false;

  const baseEpsilon = 1e-3;
  const planetRadius = Number(camera.limits?.planetRadius ?? 0);

  const radiusTolerance = Math.max(baseEpsilon, Math.abs(Number(place.radius)) * 1e-6);
  const centerTolerance = Math.max(baseEpsilon, Math.abs(planetRadius) * 1e-6);

  const yawDelta = Math.abs(wrapAngle(Number(camera.yaw) - Number(place.yaw)));
  const pitchDelta = Math.abs(Number(camera.pitch) - Number(place.pitch));
  const radiusDelta = Math.abs(Number(camera.radius) - Number(place.radius));

  const center = camera.center;
  const dx = Number(center?.x ?? NaN) - Number(place.center.x);
  const dy = Number(center?.y ?? NaN) - Number(place.center.y);
  const dz = Number(center?.z ?? NaN) - Number(place.center.z);
  const centerDelta = Math.hypot(dx, dy, dz);

  return (
    yawDelta <= baseEpsilon &&
    pitchDelta <= baseEpsilon &&
    radiusDelta <= radiusTolerance &&
    centerDelta <= centerTolerance
  );
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  let state: CameraFlyState | undefined;

  try {
    state = ensureCancelHook(camera);
  } catch {
    return Promise.resolve(false);
  }

  if (!state) return Promise.resolve(false);

  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;

  // Starting a new fly-to from this function should make previous tracked
  // flyToPlace calls settle false. If the library exposes `_cancelFly`, use it
  // to stop the animation as well.
  if (state.listeners.size > 0) {
    notifyActiveFlights(state);

    try {
      camera._cancelFly?.();
    } catch {
      // Ignore cancellation hook errors; the new fly-to attempt will still be
      // tried below, and a failure will resolve false.
    }
  }

  let flyPromise: Promise<void>;

  try {
    flyPromise = flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: place.center,
      durationMs: duration,
    });
  } catch {
    return Promise.resolve(false);
  }

  if (!flyPromise || typeof flyPromise.then !== "function") {
    return Promise.resolve(cameraArrived(camera, place));
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;

    const cancelListener = () => {
      if (settled) return;
      settled = true;
      state!.listeners.delete(cancelListener);
      resolve(false);
    };

    state!.listeners.add(cancelListener);

    const onFlySettled = () => {
      if (settled) return;
      settled = true;
      state!.listeners.delete(cancelListener);
      resolve(cameraArrived(camera, place));
    };

    const onFlyRejected = () => {
      if (settled) return;
      settled = true;
      state!.listeners.delete(cancelListener);
      resolve(false);
    };

    flyPromise.then(onFlySettled, onFlyRejected);
  });
}
