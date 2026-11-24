import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

interface FlightState {
  stop: () => void;
  dispose: () => void;
}

const activeFlights = new WeakMap<GeospatialCamera, FlightState>();

const ANGULAR_EPSILON = 1e-3;
const LINEAR_EPSILON = 1e-3;

function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  let a = angle % twoPi;
  if (a > Math.PI) a -= twoPi;
  else if (a < -Math.PI) a += twoPi;
  return a;
}

function angleDiff(a: number, b: number): number {
  return Math.abs(normalizeAngle(a - b));
}

function finite(n: number): boolean {
  return Number.isFinite(n);
}

function nearlyEqualCenter(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): boolean {
  return (
    finite(a.x) && finite(a.y) && finite(a.z) &&
    finite(b.x) && finite(b.y) && finite(b.z) &&
    Math.abs(a.x - b.x) <= LINEAR_EPSILON &&
    Math.abs(a.y - b.y) <= LINEAR_EPSILON &&
    Math.abs(a.z - b.z) <= LINEAR_EPSILON
  );
}

function arrived(camera: GeospatialCamera, place: Place): boolean {
  if (
    !finite(place.yaw) ||
    !finite(place.pitch) ||
    !finite(place.radius) ||
    !finite(camera.yaw) ||
    !finite(camera.pitch) ||
    !finite(camera.radius)
  ) {
    return false;
  }

  const radiusEpsilon = Math.max(LINEAR_EPSILON, Math.abs(place.radius) * 1e-6);

  return (
    angleDiff(camera.yaw, place.yaw) <= ANGULAR_EPSILON &&
    angleDiff(camera.pitch, place.pitch) <= ANGULAR_EPSILON &&
    Math.abs(camera.radius - place.radius) <= radiusEpsilon &&
    nearlyEqualCenter(camera.center, place.center)
  );
}

function stopPreviousFlight(camera: GeospatialCamera): void {
  const previous = activeFlights.get(camera);
  if (!previous) return;

  try {
    previous.stop();
  } catch {
    // Stop is a best-effort signal; never let cleanup rejection leak out.
  }

  try {
    previous.dispose();
  } catch {
    // Cleanup is best-effort.
  }

  if (activeFlights.get(camera) === previous) {
    activeFlights.delete(camera);
  }
}

function cancelAnyFly(camera: GeospatialCamera): void {
  try {
    if (typeof camera._cancelFly === "function") {
      camera._cancelFly();
    }
  } catch {
    // If cancellation throws, treat it as no cancellation signal.
  }
}

/**
 * Temporarily watches camera._cancelFly. When the library cancels the current
 * fly-to, this notifies the active flight so its promise can resolve false
 * even if flyGeospatialCameraToAsync’s own promise stays pending.
 *
 * It also preserves the latest _cancelFly value when possible, so it does not
 * clobber a cancellation function installed by another fly-to during the watch.
 */
function installCancelFlyWatch(
  camera: GeospatialCamera,
  notify: () => void
): () => void {
  const propertyName = "_cancelFly" as const;

  let descriptor: PropertyDescriptor | undefined;
  try {
    descriptor = Object.getOwnPropertyDescriptor(camera, propertyName);
  } catch {
    descriptor = undefined;
  }

  let current: (() => void) | undefined =
    descriptor && "value" in descriptor
      ? (descriptor.value as (() => void) | undefined)
      : camera._cancelFly;

  let assigned = false;
  let active = true;
  let usingAccessor = false;
  let usingWritable = false;

  const wrapper = () => {
    if (active) notify();

    if (typeof current === "function") {
      try {
        return current.call(camera);
      } catch {
        return undefined;
      }
    }

    return undefined;
  };

  if (!descriptor || descriptor.configurable) {
    try {
      Object.defineProperty(camera, propertyName, {
        configurable: true,
        enumerable: descriptor?.enumerable ?? true,
        get() {
          return typeof current === "function" ? wrapper : undefined;
        },
        set(value: unknown) {
          if (value !== wrapper) {
            current = value as (() => void) | undefined;
            assigned = true;
          }
        },
      });
      usingAccessor = true;
    } catch {
      usingAccessor = false;
    }
  }

  if (!usingAccessor && descriptor?.writable) {
    try {
      camera._cancelFly = wrapper;
      usingWritable = true;
    } catch {
      usingWritable = false;
    }
  }

  return () => {
    if (!active) return;
    active = false;

    if (usingAccessor) {
      if (assigned) {
        if (typeof current === "function") {
          try {
            Object.defineProperty(camera, propertyName, {
              configurable: true,
              writable: true,
              enumerable: true,
              value: current,
            });
          } catch {
            try {
              camera._cancelFly = current;
            } catch {
              // Ignore restore failure.
            }
          }
        } else {
          try {
            delete (camera as unknown as Record<string, unknown>)[propertyName];
          } catch {
            // Ignore restore failure.
          }
        }
      } else {
        if (descriptor) {
          try {
            Object.defineProperty(camera, propertyName, descriptor);
          } catch {
            // Ignore restore failure.
          }
        } else {
          try {
            delete (camera as unknown as Record<string, unknown>)[propertyName];
          } catch {
            // Ignore restore failure.
          }
        }
      }
    } else if (usingWritable) {
      try {
        if (camera._cancelFly === wrapper) {
          camera._cancelFly = current;
        }
      } catch {
        // Ignore restore failure.
      }
    }
  };
}

export async function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  let flight: FlightState | undefined;

  try {
    const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
    const center = place.center as unknown as typeof camera.center;

    // Any fly-to started by this helper must stop when a new one starts.
    stopPreviousFlight(camera);

    // Also stop any fly-to that was started elsewhere in the app, if the
    // camera exposes a cancellation hook.
    cancelAnyFly(camera);

    // Zero/negative durations settle immediately without relying on the
    // render-loop animation.
    if (duration <= 0) {
      try {
        camera._setOrientation(place.yaw, place.pitch, place.radius, center);
      } catch {
        return false;
      }

      return arrived(camera, place);
    }

    let resolveStop!: (value: boolean) => void;
    const stopPromise = new Promise<boolean>((resolve) => {
      resolveStop = resolve;
    });

    let stopped = false;
    let allowStop = false;

    const stop = () => {
      if (!stopped) {
        stopped = true;
        resolveStop(false);
      }
    };

    flight = {
      stop,
      dispose: () => {},
    };

    activeFlights.set(camera, flight);

    const notify = () => {
      if (allowStop && activeFlights.get(camera) === flight) {
        stop();
      }
    };

    const uninstallWatch = installCancelFlyWatch(camera, notify);
    flight.dispose = () => {
      uninstallWatch();
    };

    let flyPromise: Promise<void>;

    try {
      flyPromise = flyGeospatialCameraToAsync(camera, scene, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center,
        durationMs: duration,
      });
    } catch {
      return false;
    }

    const flyResult = flyPromise
      .then(() => {
        if (activeFlights.get(camera) !== flight || stopped) {
          return false;
        }

        return arrived(camera, place);
      })
      .catch(() => false);

    // Startup is done; from here on, _cancelFly calls mean this flight was
    // stopped before completion.
    allowStop = true;

    // If a newer flyToPlace replaced us during setup, make sure this promise
    // still settles false.
    if (activeFlights.get(camera) !== flight && !stopped) {
      stopped = true;
      resolveStop(false);
    }

    return await Promise.race([flyResult, stopPromise]);
  } catch {
    return false;
  } finally {
    if (flight) {
      try {
        flight.dispose();
      } catch {
        // Cleanup is best-effort.
      }

      if (activeFlights.get(camera) === flight) {
        activeFlights.delete(camera);
      }
    }
  }
}
