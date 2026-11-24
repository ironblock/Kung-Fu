import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: zero slope at both ends, so the turn eases in and out.
function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw over
 * about `durationMs`, then restores the starting heading exactly. Centre,
 * pitch and radius are left unchanged. Resolves when the turn is complete.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    // The scene is not needed for the turn itself; see the note in the report.
    void scene;

    const startYaw = camera.yaw;

    if (!(durationMs > 0)) {
        setGeospatialOrientation(camera, { yaw: startYaw });
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        let startTime: number | undefined;

        const step = (now: number): void => {
            if (startTime === undefined) {
                startTime = now;
            }
            const t = Math.min(1, (now - startTime) / durationMs);

            if (t >= 1) {
                // Land exactly on the starting heading, not startYaw + 2π.
                setGeospatialOrientation(camera, { yaw: startYaw });
                resolve();
                return;
            }

            setGeospatialOrientation(camera, { yaw: startYaw + TWO_PI * easeInOut(t) });
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    });
}
