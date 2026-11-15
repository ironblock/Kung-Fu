import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { flyGeospatialCameraToAsync } from "@babylonjs/lite";

// The turn is split into quarter-turn segments. Each segment is smaller than
// a half turn, so the shortest angular path is always the eastward one.
const SEGMENTS = 4;
const QUARTER_TURN = Math.PI / SEGMENTS * 2; // 2π / SEGMENTS

function smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
}

// Ease for segment k (0-based). Maps local progress g in [0, 1] so that the
// combined progress across all segments follows smoothstep over the whole
// turn: ease in and out, with no pause at segment boundaries.
function segmentEase(k: number): (g: number) => number {
    const start = smoothstep(k / SEGMENTS);
    const end = smoothstep((k + 1) / SEGMENTS);
    return (g: number) => (smoothstep((k + g) / SEGMENTS) - start) / (end - start);
}

/**
 * Turns the camera's heading (yaw) one full turn eastward (increasing yaw)
 * over about `durationMs`, then leaves it at its starting heading.
 * Centre, pitch and radius are unchanged. Resolves when the turn completes.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const center = camera.center;
    const pitch = camera.pitch;
    const radius = camera.radius;
    const segmentMs = durationMs / SEGMENTS;

    for (let k = 0; k < SEGMENTS; k++) {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: startYaw + QUARTER_TURN * (k + 1),
            pitch,
            radius,
            center,
            durationMs: segmentMs,
            ease: segmentEase(k),
        });
    }
}
