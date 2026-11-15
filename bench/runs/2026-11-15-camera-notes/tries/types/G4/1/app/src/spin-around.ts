import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const QUARTER_TURN = Math.PI / 2;
const TWO_PI = 2 * Math.PI;

/** Wrap an angle to [-π, π), matching the camera's own yaw range. */
function wrapAngle(angle: number): number {
    let a = (angle + Math.PI) % TWO_PI;
    if (a < 0) a += TWO_PI;
    return a - Math.PI;
}

/**
 * Turn the camera's heading one full turn eastward (increasing yaw) over about
 * `durationMs`, ending on the heading it started with. Centre, pitch and radius
 * are left untouched.
 *
 * A full turn is performed as four quarter-turn flights. Each flight is at most
 * π/2 away, so its shortest angular path is exactly the eastward quarter turn.
 * Constant speed is used so the turn stays continuous across the segment
 * boundaries (per-segment easing would pause at every quarter).
 *
 * If something else moves the camera's yaw during the turn (user input, another
 * flight, or a yaw limit), the spin stops where it is and the promise resolves.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    if (!(durationMs > 0)) return;

    const startYaw = camera.yaw;
    const segmentMs = durationMs / 4;
    const linear = (g: number) => g;

    for (let k = 1; k <= 4; k++) {
        const target = wrapAngle(startYaw + k * QUARTER_TURN);
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: target,
            durationMs: segmentMs,
            ease: linear,
        });
        // The fly resolves early when interrupted; stop rather than fight the user.
        if (Math.abs(wrapAngle(camera.yaw - target)) > 1e-4) return;
    }
}
