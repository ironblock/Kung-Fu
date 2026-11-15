import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const QUARTER_TURN = Math.PI / 2;
const TWO_PI = Math.PI * 2;
const SNAP_EPSILON = 1e-6;

const linear = (g: number): number => g;

/**
 * Turns the geospatial camera's heading (yaw) one full turn eastward, i.e. with
 * increasing yaw, over about `durationMs` of the render loop, then leaves it on
 * the heading it started with. Centre, pitch and radius are held as they are.
 *
 * The turn is made of four quarter-turn flights. Each flight's goal is relative
 * to the yaw at the moment it starts and is exactly +PI/2, so every step takes
 * the short arc and always runs eastward. The promise resolves after the last
 * flight has finished.
 */
export async function spinAround(
  camera: GeospatialCamera,
  scene: SceneContext,
  durationMs: number,
): Promise<void> {
  const startYaw = camera.yaw;
  const stepMs = durationMs / 4;

  for (let i = 0; i < 4; i++) {
    // Read the current pose each step so that the flight only changes yaw.
    const c = camera.center;
    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: camera.yaw + QUARTER_TURN,
      pitch: camera.pitch,
      radius: camera.radius,
      center: { x: c.x, y: c.y, z: c.z },
      durationMs: stepMs,
      ease: linear,
    });
  }

  // Four quarter turns land on the start heading up to floating-point error.
  // Snap to the exact starting yaw, but only when the error is negligible so
  // that a heading the user changed during the spin is left alone.
  let diff = camera.yaw - startYaw;
  diff = (((diff + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI - Math.PI;
  if (Math.abs(diff) < SNAP_EPSILON) {
    camera.yaw = startYaw;
  }
}
