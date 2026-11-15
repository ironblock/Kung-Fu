import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// The turn is split into flights. Each flight covers less than half a turn, so
// the shortest-path rule used by flyGeospatialCameraToAsync always picks the
// eastward (increasing-yaw) direction.
const SEGMENTS = 6;

// Tolerance for deciding that a flight reached its target yaw.
const ARRIVE_EPSILON = 1e-3;

// Cubic ease-in-out on normalized progress x in [0, 1].
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Wrap an angle into [-π, π), matching the camera's yaw range.
function wrapAngle(a: number): number {
  return a - TWO_PI * Math.floor((a + Math.PI) / TWO_PI);
}

/**
 * Turn the camera's heading (yaw) one full turn eastward over about `durationMs`
 * of the scene's render loop, with ease-in-out. Centre, pitch and radius are
 * untouched. The camera ends at the heading it started with.
 *
 * Resolves early (without finishing the turn) if the flight is interrupted,
 * for example by user input or by another flight on the same camera.
 */
export async function spinAround(
  camera: GeospatialCamera,
  scene: SceneContext,
  durationMs: number,
): Promise<void> {
  const startYaw = camera.yaw;
  const segmentMs = durationMs / SEGMENTS;

  for (let k = 0; k < SEGMENTS; k++) {
    // Overall eased progress at the segment boundaries, as fractions of a turn.
    const e0 = easeInOutCubic(k / SEGMENTS);
    const e1 = easeInOutCubic((k + 1) / SEGMENTS);
    const span = e1 - e0; // > 0, and < 0.5 for this segment count

    const isLast = k === SEGMENTS - 1;
    // Final flight targets the exact starting heading, not start + 2π.
    const targetYaw = wrapAngle(isLast ? startYaw : startYaw + TWO_PI * e1);

    await flyGeospatialCameraToAsync(camera, scene, {
      yaw: targetYaw,
      durationMs: segmentMs,
      // Map this flight's linear progress g onto the overall eased curve so the
      // turn as a whole eases in and out, with no stop at each segment boundary.
      ease: (g: number) => (easeInOutCubic((k + g) / SEGMENTS) - e0) / span,
    });

    // If the flight did not reach its target, something interrupted it.
    // Stop rather than start a new flight from an unexpected heading.
    if (Math.abs(wrapAngle(camera.yaw - targetYaw)) > ARRIVE_EPSILON) {
      return;
    }
  }
}
