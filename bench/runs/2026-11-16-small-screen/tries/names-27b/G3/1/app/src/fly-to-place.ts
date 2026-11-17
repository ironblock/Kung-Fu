import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

interface FlightState {
  cancelled: boolean;
  settled: boolean;
  active: boolean;
  wrapper: (() => void) | undefined;
  underlying: (() => void) | undefined;
  settle: (arrived: boolean) => void;
  cancel: () => void;
}

const activeFlights = new WeakMap<GeospatialCamera, FlightState>();

function angleClose(a: number, b: number): boolean {
  const delta = Math.atan2(Math.sin(a - b), Math.cos(a - b));
  return Math.abs(delta) <= 1e-4;
}

function valueClose(a: number, b: number): boolean {
  const tolerance = Math.max(1e-4, 1e-6 * Math.max(Math.abs(a), Math.abs(b)));
  return Math.abs(a - b) <= tolerance;
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  return (
    angleClose(camera.yaw, place.yaw) &&
    valueClose(camera.pitch, place.pitch) &&
    valueClose(camera.radius, place.radius) &&
    valueClose(camera.center.x, place.center.x) &&
    valueClose(camera.center.y, place.center.y) &&
    valueClose(camera.center.z, place.center.z)
  );
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number,
): Promise<boolean> {
  const previous = activeFlights.get(camera);

  const currentCancel = camera._cancelFly;
  if (typeof currentCancel === "function") {
    currentCancel();
  }

  if (previous && !previous.settled) {
    previous.cancel();
  }

  const state: FlightState = {
    cancelled: false,
    settled: false,
    active: true,
    wrapper: undefined,
    underlying: undefined,
    settle: () => {},
    cancel: () => {},
  };

  const promise = new Promise<boolean>((resolve) => {
    state.settle = (arrived: boolean) => {
      if (state.settled) return;

      state.settled = true;
      state.active = false;
      resolve(arrived);

      try {
        Object.defineProperty(camera, "_cancelFly", {
          value: state.underlying,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch {
        // The camera object may be frozen or otherwise hostile; the flight result has already been resolved.
      }

      if (activeFlights.get(camera) === state) {
        activeFlights.delete(camera);
      }
    };
  });

  let flyPromise: Promise<void>;
  try {
    flyPromise = flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: place.center,
      durationMs: Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0,
    });
  } catch {
    state.settle(false);
    return promise;
  }

  state.underlying = camera._cancelFly;

  const wrapper = () => {
    if (state.settled || state.cancelled) return;

    state.cancelled = true;

    const underlying = state.underlying;
    if (typeof underlying === "function" && underlying !== wrapper) {
      try {
        underlying();
      } catch {
        // Ignore cancellation errors; the flight is being stopped.
      }
    }

    state.underlying = undefined;
    state.settle(isAtPlace(camera, place));
  };

  state.wrapper = wrapper;
  state.cancel = wrapper;

  try {
    Object.defineProperty(camera, "_cancelFly", {
      configurable: true,
      enumerable: true,
      get: () => (state.active ? wrapper : state.underlying),
      set: (value: (() => void) | undefined) => {
        if (!state.active) {
          state.underlying = value;
          return;
        }

        const old = state.underlying;
        state.underlying = value;

        if (
          !state.settled &&
          !state.cancelled &&
          typeof old === "function" &&
          typeof value === "function" &&
          value !== wrapper &&
          value !== old
        ) {
          state.cancelled = true;

          try {
            old();
          } catch {
            // Ignore cancellation errors; the flight is being stopped.
          }

          state.underlying = value;
          state.settle(isAtPlace(camera, place));
        }
      },
    });
  } catch {
    // If the camera object cannot accept an accessor, fall back to a plain assignment.
    camera._cancelFly = wrapper;
  }

  activeFlights.set(camera, state);

  flyPromise.then(
    () => {
      if (!state.settled) {
        state.settle(!state.cancelled);
      }
    },
    () => {
      state.settle(false);
    },
  );

  return promise;
}
