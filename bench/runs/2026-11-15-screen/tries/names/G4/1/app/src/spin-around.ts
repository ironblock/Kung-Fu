import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Ease-in-out (quadratic). Maps [0, 1] to [0, 1], monotonic, with zero slope at both ends.
function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2)) / 2;
}

/**
 * Turns the geospatial camera's heading (yaw) one full turn eastward (increasing yaw)
 * over roughly `durationMs`, then restores the starting heading exactly.
 * Centre, pitch and radius are left unchanged.
 * Resolves when the turn is complete.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    // `scene` is accepted for the agreed signature. The declarations provided do not
    // describe a per-frame hook on the scene, so timing is driven by requestAnimationFrame.
    void scene;

    const startYaw = camera.yaw;

    if (!(durationMs > 0)) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        const startTime = performance.now();

        const step = (): void => {
            const elapsed = performance.now() - startTime;
            const t = Math.min(1, elapsed / durationMs);

            if (t >= 1) {
                // Land exactly on the starting heading (one full turn is the same heading).
                camera._setOrientation(startYaw, camera.pitch, camera.radius, camera.center);
                resolve();
                return;
            }

            camera._setOrientation(
                startYaw + TWO_PI * easeInOut(t),
                camera.pitch,
                camera.radius,
                camera.center,
            );
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    });
}
