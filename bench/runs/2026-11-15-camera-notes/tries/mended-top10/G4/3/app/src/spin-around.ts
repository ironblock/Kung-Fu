import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

// The render-loop hook is not declared in the type files I was given.
// Assumed: scene._beforeRender is an array of () => void, run once per frame
// before the camera pose is applied. Verify this against Babylon Lite 1.39.0.
interface BeforeRenderHost {
    _beforeRender: Array<() => void>;
}

const TWO_PI = Math.PI * 2;

// Monotonic on [0, 1], so the yaw never moves backward.
function smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
}

/**
 * Turns the camera's heading one full turn toward increasing yaw over
 * roughly `durationMs`, driven by the scene's render loop. Centre, pitch and
 * radius are kept as they are. The promise resolves after the final frame.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    if (!(durationMs > 0)) {
        return Promise.resolve();
    }

    const { yawMin, yawMax } = camera.limits;
    if (Number.isFinite(yawMin) && Number.isFinite(yawMax) && yawMax - yawMin < TWO_PI) {
        return Promise.reject(new Error("spinAround: camera yaw limits are narrower than a full turn"));
    }

    const hooks = (scene as unknown as BeforeRenderHost)._beforeRender;
    if (!Array.isArray(hooks)) {
        return Promise.reject(new Error("spinAround: scene._beforeRender is not an array; render hook assumption is wrong"));
    }

    const startYaw = camera.yaw;

    return new Promise<void>((resolve) => {
        let startTime: number | undefined;

        const frame = (): void => {
            const now = performance.now();
            if (startTime === undefined) {
                startTime = now;
            }
            const t = Math.min(1, (now - startTime) / durationMs);

            // Pass the current pitch and radius back in, so a pitch that the
            // geospatial clamp would otherwise reset is preserved.
            setGeospatialOrientation(camera, {
                yaw: startYaw + TWO_PI * smoothstep(t),
                pitch: camera.pitch,
                radius: camera.radius,
            });

            if (t >= 1) {
                const index = hooks.indexOf(frame);
                if (index >= 0) {
                    hooks.splice(index, 1);
                }
                resolve();
            }
        };

        hooks.push(frame);
    });
}
