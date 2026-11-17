import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

export interface Place {
  yaw: number;
  pitch: number;
  radius: number;
  center: { x: number; y: number; z: number };
}

type Vec3Like = { x: number; y: number; z: number };

type OrientationTarget = {
  yaw: number;
  pitch: number;
  radius: number;
  center: Vec3Like;
};

type FlightState = {
  token: number;
  target: OrientationTarget;
  resolve: (value: boolean) => void;
  settled: boolean;
  easeCalled: boolean;
  maxProgress: number;
};

const flights = new WeakMap<GeospatialCamera, FlightState>();
let nextToken = 0;

const TWO_PI = Math.PI * 2;

// The library exposes GEO_EPSILON = 0.001, so use a comparable arrival tolerance.
const ANGLE_EPS = 1e-3;
const RADIUS_EPS = 1e-3;
const CENTER_EPS = 1e-3;
const PROGRESS_EPS = 1e-3;

function normalizeAngle(angle: number): number {
  let a = angle % TWO_PI;
  if (a > Math.PI) a -= TWO_PI;
  else if (a < -Math.PI) a += TWO_PI;
  return a;
}

function shortestAngleDiff(a: number, b: number): number {
  let d = normalizeAngle(a) - normalizeAngle(b);
  d = (d + Math.PI) % TWO_PI;
  if (d < 0) d += TWO_PI;
  d -= Math.PI;
  return Math.abs(d);
}

function finite(n: number): boolean {
  return Number.isFinite(n);
}

function makeTarget(place: Place): OrientationTarget | null {
  if (
    !finite(place.yaw) ||
    !finite(place.pitch) ||
    !finite(place.radius) ||
    !finite(place.center.x) ||
    !finite(place.center.y) ||
    !finite(place.center.z)
  ) {
    return null;
  }

  return {
    yaw: normalizeAngle(place.yaw),
    pitch: normalizeAngle(place.pitch),
    radius: place.radius,
    center: {
      x: place.center.x,
      y: place.center.y,
      z: place.center.z,
    },
  };
}

function isAtPlace(
  camera: GeospatialCamera,
  target: OrientationTarget,
  easeCalled: boolean,
  maxProgress: number
): boolean {
  // If the fly-to did invoke its ease callback, use that progress as a strong
  // signal that the animation completed. If it did not, fall back to the final
  // pose comparison alone.
  if (easeCalled && maxProgress < 1 - PROGRESS_EPS) return false;

  if (
    !finite(camera.yaw) ||
    !finite(camera.pitch) ||
    !finite(camera.radius) ||
    !finite(camera.center.x) ||
    !finite(camera.center.y) ||
    !finite(camera.center.z)
  ) {
    return false;
  }

  if (shortestAngleDiff(camera.yaw, target.yaw) > ANGLE_EPS) return false;
  if (shortestAngleDiff(camera.pitch, target.pitch) > ANGLE_EPS) return false;
  if (Math.abs(camera.radius - target.radius) > RADIUS_EPS) return false;

  if (Math.abs(camera.center.x - target.center.x) > CENTER_EPS) return false;
  if (Math.abs(camera.center.y - target.center.y) > CENTER_EPS) return false;
  if (Math.abs(camera.center.z - target.center.z) > CENTER_EPS) return false;

  return true;
}

function applyImmediately(camera: GeospatialCamera, target: OrientationTarget): void {
  try {
    camera._setOrientation(
      target.yaw,
      target.pitch,
      target.radius,
      { ...target.center } as any
    );
  } catch {
    // If the internal orientation setter is unavailable/fails, fall back to direct
    // writes. Note 7 says radius/pitch must be applied together or radius first;
    // center assignment as a whole object re-orbits immediately.
    try {
      camera.radius = target.radius;
      camera.center = { ...target.center } as any;
      camera.pitch = target.pitch;
      camera.yaw = target.yaw;
    } catch {
      // Do nothing. The arrival check will decide the result.
    }
  }
}

export function flyToPlace(
  camera: GeospatialCamera,
  scene: SceneContext,
  place: Place,
  durationMs: number
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let promiseSettled = false;
    const settle = (value: boolean): void => {
      if (!promiseSettled) {
        promiseSettled = true;
        resolve(value);
      }
    };

    let state: FlightState | undefined;

    try {
      const target = makeTarget(place);
      if (!target) {
        settle(false);
        return;
      }

      // A new fly-to from this function stops any older tracked fly-to on the
      // same camera. Resolve the older promise immediately according to whether
      // it had already arrived before being interrupted.
      const previous = flights.get(camera);
      if (previous && !previous.settled) {
        const previousArrived = isAtPlace(
          camera,
          previous.target,
          previous.easeCalled,
          previous.maxProgress
        );
        previous.settled = true;
        previous.resolve(previousArrived);
      }

      // Ask the camera itself to cancel any current fly-to, including ones that
      // may have been started outside this function.
      try {
        camera._cancelFly?.();
      } catch {
        // _cancelFly is optional and may be absent; ignore.
      }

      state = {
        token: ++nextToken,
        target,
        resolve: settle,
        settled: false,
        easeCalled: false,
        maxProgress: 0,
      };
      flights.set(camera, state);

      const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;

      if (duration <= 0) {
        applyImmediately(camera, target);
        const arrived = isAtPlace(camera, target, false, 0);
        state.settled = true;
        settle(arrived);
        return;
      }

      const ease = (g: number): number => {
        if (Number.isFinite(g)) {
          state!.easeCalled = true;
          if (g > state!.maxProgress) state!.maxProgress = g;

          // Smoothstep keeps the motion eased while still recording raw progress.
          const t = g < 0 ? 0 : g > 1 ? 1 : g;
          return t * t * (3 - 2 * t);
        }
        return g;
      };

      void (async () => {
        try {
          await flyGeospatialCameraToAsync(camera, scene, {
            yaw: target.yaw,
            pitch: target.pitch,
            radius: target.radius,
            center: { ...target.center } as any,
            durationMs: duration,
            ease,
          });
        } catch {
          // flyGeospatialCameraToAsync is documented never to reject, but catch
          // host errors anyway so our promise cannot reject.
        }

        if (state!.settled) return;

        const arrived = isAtPlace(
          camera,
          target,
          state!.easeCalled,
          state!.maxProgress
        );
        state!.settled = true;
        settle(arrived);
      })();
    } catch {
      if (state) state.settled = true;
      settle(false);
    }
  });
}
