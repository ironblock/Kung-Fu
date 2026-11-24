import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
const QUARTER_TURN = Math.PI / 2;
const LEG_COUNT = 4;
// Tolerance (radians) used to decide whether a leg ran to its end or was cut short by input.
const ANGLE_TOLERANCE = 1e-3;

/** Signed angular difference a - b, wrapped into [-PI, PI). */
function angleDelta(a: number, b: number): number {
    return ((((a - b + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
}

/**
 * Turns the geospatial camera one full turn eastward (increasing yaw) around its
 * current centre, keeping centre, pitch and radius unchanged, and ends at the
 * starting heading. Resolves when the turn completes, or early if user input
 * interrupts it.
 *
 * The turn is split into quarter-turn legs because flyGeospatialCameraToAsync
 * always takes the short way round, and a single leg can only cover up to PI
 * unambiguously. Each leg is a quarter turn, so the direction is always +.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const legMs = durationMs / LEG_COUNT;

    for (let leg = 0; leg < LEG_COUNT; leg++) {
        const expectedYaw = angleDelta(startYaw + (leg + 1) * QUARTER_TURN, 0);

        // Re-read centre, pitch and radius each leg so the spin keeps whatever
        // the camera currently has, and pass them back unchanged.
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: expectedYaw,
            pitch: camera.pitch,
            radius: camera.radius,
            center: { x: camera.center.x, y: camera.center.y, z: camera.center.z },
            durationMs: legMs,
            ease: linear,
        });

        // A flight cut short by input resolves without reaching its target.
        if (Math.abs(angleDelta(camera.yaw, expectedYaw)) > ANGLE_TOLERANCE) {
            return;
        }
    }
}

function linear(g: number): number {
    return g;
}
