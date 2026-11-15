import { flyGeospatialCameraToAsync } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
const QUARTER_TURN = Math.PI / 2;
const SEGMENTS = 4;
// Tolerance (radians) for deciding that a segment actually reached its target heading.
const ARRIVAL_EPSILON = 1e-4;

// Signed difference a - b, wrapped into [-PI, PI].
function angleDelta(a: number, b: number): number {
    const d = a - b;
    return d - TWO_PI * Math.round(d / TWO_PI);
}

// Linear easing keeps the angular speed constant across segment boundaries.
const linear = (g: number): number => g;

/**
 * Turns the geospatial camera's heading one full turn eastward (increasing yaw)
 * over roughly durationMs, then restores the starting heading. Centre, pitch and
 * radius are held as they are.
 *
 * The turn is done as four quarter-turn flights, each shorter than half a turn,
 * so the flight's shortest-path yaw rule always takes the eastward direction.
 * If a segment does not reach its target heading (user input, a newer flight,
 * or yaw limits), the spin stops where it is and the promise resolves.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const segmentMs = durationMs / SEGMENTS;

    for (let i = 0; i < SEGMENTS; i++) {
        const toYaw = camera.yaw + QUARTER_TURN;
        // Copy the live centre so the flight does not hold a reference to it.
        const center = { x: camera.center.x, y: camera.center.y, z: camera.center.z };

        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: toYaw,
            pitch: camera.pitch,
            radius: camera.radius,
            center,
            durationMs: segmentMs,
            ease: linear,
        });

        if (Math.abs(angleDelta(camera.yaw, toYaw)) > ARRIVAL_EPSILON) {
            // Interrupted: leave the camera where the user or another flight put it.
            return;
        }
    }

    // Four quarter turns land on the same heading modulo 2*PI; set the original value exactly.
    camera.yaw = startYaw;
}
