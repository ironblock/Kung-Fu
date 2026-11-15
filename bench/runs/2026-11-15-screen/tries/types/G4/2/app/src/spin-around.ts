import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/**
 * Number of chained fly-to segments. Each segment turns by 2π / SEGMENTS (120°),
 * which is always less than π, so the flight's shortest-path rule is guaranteed
 * to take the eastward (increasing-yaw) direction.
 */
const SEGMENTS = 3;

/** Wrap an angle to [-π, π), matching the camera's yaw range. */
function wrapRadians(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

/** Constant-rate easing: each segment moves through yaw at a steady speed. */
const linear = (g: number): number => g;

/**
 * Turn the camera one full turn eastward (increasing yaw) over about `durationMs`,
 * ending on the heading it started with. Centre, pitch and radius are untouched.
 *
 * Implemented as a chain of yaw-only fly-to segments driven by the scene's render
 * loop. If the user interacts with the camera (or another flight starts), the
 * current segment resolves early; the spin then stops where it is and this promise
 * resolves without finishing the turn.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const segmentMs = durationMs / SEGMENTS;

    for (let i = 1; i <= SEGMENTS; i++) {
        // The last segment targets the exact starting yaw so the heading lands
        // precisely where it began, with no accumulated floating-point drift.
        const targetYaw = i === SEGMENTS ? startYaw : wrapRadians(startYaw + (TWO_PI * i) / SEGMENTS);

        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: targetYaw,
            durationMs: segmentMs,
            ease: linear,
        });

        // A segment that was interrupted resolves early, leaving yaw away from its target.
        if (Math.abs(wrapRadians(camera.yaw - targetYaw)) > 1e-4) {
            return;
        }
    }
}
