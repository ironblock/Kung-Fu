import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: zero velocity at both ends, so the turn eases in and out.
function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Turns the geospatial camera's heading (yaw) one full turn toward increasing yaw.
 * Centre, pitch and radius are read from the camera on every frame, so they are
 * left as they are. Resolves when the turn is complete.
 */
export function spinAround(
  camera: GeospatialCamera,
  _scene: SceneContext,
  durationMs: number,
): Promise<void> {
  const startYaw = camera.yaw;

  // A full turn cannot fit into a yaw range narrower than 2π.
  const { yawMin, yawMax } = camera.limits;
  if (yawMax - yawMin < TWO_PI) {
    return Promise.reject(
      new Error(`spinAround: camera yaw limits [${yawMin}, ${yawMax}] cannot hold a full turn`),
    );
  }

  return new Promise<void>((resolve) => {
    if (!(durationMs > 0)) {
      resolve();
      return;
    }

    let startTime: number | undefined;

    const step = (now: number): void => {
      if (startTime === undefined) {
        startTime = now;
      }
      const t = Math.min(1, (now - startTime) / durationMs);

      // Yaw only ever increases: startYaw .. startYaw + 2π.
      setGeospatialOrientation(camera, {
        yaw: startYaw + TWO_PI * easeInOut(t),
        pitch: camera.pitch,
        radius: camera.radius,
        center: camera.center,
      });

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
}
