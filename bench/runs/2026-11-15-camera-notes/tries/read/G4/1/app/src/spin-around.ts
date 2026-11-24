import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: eases in and out, is non-decreasing on [0, 1], and maps 0 -> 0 and 1 -> 1.
function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw over about
 * `durationMs`, then restores the starting heading. Center, pitch and radius are untouched.
 * Resolves when the turn is complete.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    void scene; // see the frame-driver note below

    if (!(durationMs > 0)) {
        return Promise.resolve();
    }

    const startYaw = camera.yaw;

    // Yaw limits would clamp the turn partway round. Lift them for the duration and restore after.
    const limits = camera.limits;
    const savedYawMin = limits.yawMin;
    const savedYawMax = limits.yawMax;
    limits.yawMin = -Infinity;
    limits.yawMax = Infinity;

    return new Promise<void>((resolve) => {
        const startTime = performance.now();

        // Frame driver: requestAnimationFrame. The per-frame hook of the scene's render loop is
        // not declared in the provided type files, so it is not used here. To run on the scene's
        // own loop, replace the requestAnimationFrame calls in `step` with that hook.
        const step = (now: number): void => {
            const elapsed = Math.max(0, now - startTime);
            const t = Math.min(1, elapsed / durationMs);

            if (t >= 1) {
                // Writing the start yaw exactly avoids floating-point drift from the wrap.
                camera.yaw = startYaw;
                limits.yawMin = savedYawMin;
                limits.yawMax = savedYawMax;
                resolve();
                return;
            }

            // The setter wraps yaw into [-PI, PI). Because the value is always start + a
            // non-decreasing offset from start, the turn never runs backward.
            camera.yaw = startYaw + TWO_PI * easeInOut(t);
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    });
}
