import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const FULL_TURN = Math.PI * 2;

// Cubic ease-in-out. It is non-decreasing on [0, 1] with f(0) = 0 and f(1) = 1,
// so the yaw only ever moves toward increasing values.
function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ASSUMPTION (camera-notes.md item 1): attachControl drives the camera from a
// per-frame callback on scene._beforeRender. That field is not in the supplied
// typings, so it is typed here as an array of callbacks. Verify this shape
// against the real library before relying on it.
interface SceneWithBeforeRender {
    _beforeRender: Array<() => void>;
}

/**
 * Turns the camera's heading (yaw) one full turn eastward over about durationMs
 * of the scene's render loop. Only yaw is written: center, pitch and radius are
 * left alone. The camera finishes at the heading it started with.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const host = scene as unknown as SceneWithBeforeRender;
    const startYaw = camera.yaw;

    return new Promise<void>((resolve) => {
        let startTime: number | null = null;

        const onFrame = (): void => {
            const now = performance.now();
            // The clock starts on the first rendered frame, not when the call is made.
            if (startTime === null) {
                startTime = now;
            }
            const t = durationMs > 0 ? Math.min(1, (now - startTime) / durationMs) : 1;

            if (t >= 1) {
                // Write the exact starting heading rather than startYaw + 2π, which
                // could differ from it by floating-point error after wrapping.
                camera.yaw = startYaw;
                const index = host._beforeRender.indexOf(onFrame);
                if (index >= 0) {
                    host._beforeRender.splice(index, 1);
                }
                resolve();
                return;
            }

            // Computed from the starting yaw each frame, not from the read-back value,
            // because the stored yaw is wrapped to [-PI, PI).
            camera.yaw = startYaw + FULL_TURN * easeInOutCubic(t);
        };

        host._beforeRender.push(onFrame);
    });
}
