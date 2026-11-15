import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

const QUARTER_TURN = Math.PI / 2;

// Linear easing keeps the turn at a constant rate across the leg boundaries.
const linear = (g: number): number => g;

/**
 * Turns the geospatial camera's heading (yaw) one full turn eastward (increasing yaw),
 * keeping centre, pitch and radius unchanged. Resolves when the turn is complete.
 *
 * The turn is split into four quarter-turn legs so that each leg's yaw delta is
 * unambiguous (well under pi), regardless of how the fly animation chooses its path.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const pitch = camera.pitch;
    const radius = camera.radius;
    const legMs = durationMs / 4;

    for (let leg = 1; leg <= 4; leg++) {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: startYaw + leg * QUARTER_TURN,
            pitch,
            radius,
            center: { ...camera.center },
            durationMs: legMs,
            ease: linear,
        });
    }
}
