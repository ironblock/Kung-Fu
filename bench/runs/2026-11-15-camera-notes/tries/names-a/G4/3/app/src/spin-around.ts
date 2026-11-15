import {
    flyGeospatialCameraToAsync,
    setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

// The turn is split into legs of a quarter turn each. Every leg's yaw target is
// less than π away from the previous one, so the eastward direction is the same
// whether the fly code interpolates linearly or along the shortest arc.
const LEGS = 4;

/**
 * Turns the camera's heading one full turn toward increasing yaw over about
 * `durationMs`, keeping centre, pitch and radius fixed. Resolves when the turn
 * is complete, with the camera back at its starting yaw.
 */
export async function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;
    const pitch = camera.pitch;
    const radius = camera.radius;
    const center = { ...camera.center };
    const legMs = durationMs / LEGS;
    const quarterTurn = Math.PI / 2;

    for (let i = 1; i <= LEGS; i++) {
        await flyGeospatialCameraToAsync(camera, scene, {
            yaw: startYaw + i * quarterTurn,
            pitch,
            radius,
            center,
            durationMs: legMs,
            // Linear per leg: per-leg easing would stop the camera at every leg boundary.
            ease: (g: number) => g,
        });
    }

    // Snap back to the exact starting heading (a 2π-equivalent value).
    setGeospatialOrientation(camera, { yaw: startYaw, pitch, radius, center });
}
