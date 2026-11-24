import { flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

interface ActiveFlight {
  settled: boolean;
  resolve: (arrived: boolean) => void;
  place: Place;
}

const activeFlights = new WeakMap<GeospatialCamera, ActiveFlight>();

function settle(flight: ActiveFlight, arrived: boolean): void {
  if (!flight.settled) {
    flight.settled = true;
    flight.resolve(arrived);
  }
}

function angleDifference(a: number, b: number): number {
  const delta = a - b;
  const normalized =
    ((delta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  return Math.abs(normalized);
}

function vectorDistance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isAtPlace(camera: GeospatialCamera, place: Place): boolean {
  try {
    const angleTolerance = 0.001;
    const planetRadius = Number.isFinite(camera.limits.planetRadius)
      ? camera.limits.planetRadius
      : 0;
    const distanceTolerance = Math.max(0.001, planetRadius * 1e-3);

    return (
      angleDifference(camera.yaw, place.yaw) <= angleTolerance &&
      Math.abs(camera.pitch - place.pitch) <= angleTolerance &&
      Math.abs(camera.radius - place.radius) <= distanceTolerance &&
      vectorDistance(camera.center, place.center) <= distanceTolerance
    );
  } catch {
    return false;
  }
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  const previous = activeFlights.get(camera);
  if (previous) {
    settle(previous, false);
  }

  try {
    camera._cancelFly?.();
  } catch {
    // A failing cancel should not prevent starting the new flight.
  }

  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;

  if (duration <= 0) {
    try {
      setGeospatialOrientation(camera, {
        yaw: place.yaw,
        pitch: place.pitch,
        radius: place.radius,
        center: {
          x: place.center.x,
          y: place.center.y,
          z: place.center.z,
        },
      });
    } catch {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  let resolve!: (arrived: boolean) => void;
  const promise = new Promise<boolean>((res) => {
    resolve = res;
  });

  const flight: ActiveFlight = {
    settled: false,
    resolve,
    place,
  };
  activeFlights.set(camera, flight);

  let flyPromise: Promise<void>;
  try {
    flyPromise = flyGeospatialCameraToAsync(camera, scene, {
      yaw: place.yaw,
      pitch: place.pitch,
      radius: place.radius,
      center: {
        x: place.center.x,
        y: place.center.y,
        z: place.center.z,
      },
      durationMs: duration,
    });
  } catch {
    settle(flight, false);
    return promise;
  }

  flyPromise
    .then(() => {
      settle(flight, isAtPlace(camera, place));
    })
    .catch(() => {
      settle(flight, isAtPlace(camera, place));
    });

  return promise;
}
