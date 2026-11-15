import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
const LEGS = 4;

/** Wrap an angle to [-π, π). */
function wrapAngle(angle: number): number {
    return ((((angle + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

/**
 * Turn the camera's heading (yaw) one full turn eastward (increasing yaw) about
 * its current centre, keeping centre, pitch and radius unchanged. The camera
 * ends on the heading it started with.
 *
 * The turn is split into quarter-turn flights, because a single flight always
 * takes the shortest angular path and cannot cover a full 2π. Each leg is
 * linear in time, so the turn has constant angular speed with no stop at the
 * joins.
 *
 * Resolves when the turn completes, or early if the turn is interrupted by user
 * input or another camera flight.
 *
 * yaw limits (`camera.limits.yawMin` / `yawMax`) are relaxed for the duration of
 * the turn, since a full turn cannot fit within a narrower yaw range, and are
 * restored afterwards.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const limits = camera.limits;
    const savedYawMin = limits.yawMin;
    const savedYawMax = limits.yawMax;
    limits.yawMin = -Infinity;
    limits.yawMax = Infinity;

    const legMs = durationMs / LEGS;
    const linear = (g: number) => g;

    try {
        for (let leg = 1; leg <= LEGS; leg++) {
            // The last leg targets the exact starting yaw so the heading is restored.
            const target = leg === LEGS ? startYaw : wrapAngle(startYaw + (leg * TWO_PI) / LEGS);

            await flyGeospatialCameraToAsync(camera, scene, {
                yaw: target,
                durationMs: legMs,
                centerHopScale: 0,
                ease: linear,
            });

            // If the flight was cut short (user input, or another flight), stop
            // rather than start the next leg over the top of it.
            if (Math.abs(wrapAngle(camera.yaw - target)) > 1e-3) {
                return;
            }
        }
    } finally {
        limits.yawMin = savedYawMin;
        limits.yawMax = savedYawMax;
    }
}
