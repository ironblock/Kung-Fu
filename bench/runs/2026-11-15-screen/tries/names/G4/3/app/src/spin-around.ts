import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";
import { setGeospatialOrientation } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/** Smoothstep: eases in and out, maps [0, 1] to [0, 1]. */
function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

/**
 * Turns the geospatial camera's heading (yaw) one full turn toward increasing yaw,
 * over roughly `durationMs` of the scene's render loop. Centre, pitch and radius are
 * left unchanged, and the camera ends with the yaw it started with.
 *
 * Resolves when the turn is complete. Rejects if the camera's yaw limits are too
 * narrow to allow a full turn.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const { yawMin, yawMax } = camera.limits;
    if (yawMax - yawMin < TWO_PI) {
        return Promise.reject(
            new Error(`spinAround: yaw limits [${yawMin}, ${yawMax}] are narrower than a full turn`),
        );
    }

    const startYaw = camera.yaw;
    const center = camera.center;
    const pitch = camera.pitch;
    const radius = camera.radius;

    const applyYaw = (yaw: number) => {
        setGeospatialOrientation(camera, { yaw, pitch, radius, center });
    };

    if (!(durationMs > 0)) {
        applyYaw(startYaw);
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        const startTime = performance.now();

        // Render-loop hook: assumed to be an observable on the scene. Adjust if the
        // Babylon Lite SceneContext exposes its per-frame callback under another name.
        const observer = scene.onBeforeRenderObservable.add(() => {
            const t = Math.min(1, (performance.now() - startTime) / durationMs);
            if (t >= 1) {
                observer.remove();
                applyYaw(startYaw);
                resolve();
                return;
            }
            applyYaw(startYaw + TWO_PI * easeInOut(t));
        });
    });
}
