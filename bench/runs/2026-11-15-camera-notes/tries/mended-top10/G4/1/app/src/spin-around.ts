import { setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

type BeforeRenderHook = () => void;

// Smoothstep: maps 0 -> 0 and 1 -> 1, and never decreases in between.
function ease(t: number): number {
    return t * t * (3 - 2 * t);
}

// ASSUMPTION: the render hooks live in `scene._beforeRender`, an array of
// per-frame callbacks (the Lite camera notes describe the library pushing
// onto it). The SceneContext declarations are not in camera-api.d.ts, so this
// is not checked against the library's types.
function beforeRenderHooks(scene: SceneContext): BeforeRenderHook[] {
    return (scene as unknown as { _beforeRender: BeforeRenderHook[] })._beforeRender;
}

/**
 * Turns the camera's heading one full turn toward increasing yaw over
 * `durationMs` of the scene's render loop, with ease-in and ease-out.
 * Centre, pitch and radius are left as they are.
 *
 * The final yaw is the starting yaw plus 2π, which is the same heading.
 * Yaw is never written backward, so the stored value cannot return to the
 * exact starting number.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    if (!(durationMs > 0)) {
        return Promise.reject(new RangeError(`spinAround: durationMs must be positive, got ${durationMs}`));
    }

    const startYaw = camera.yaw;

    return new Promise<void>((resolve) => {
        const hooks = beforeRenderHooks(scene);
        const startTime = performance.now();

        const onFrame = (): void => {
            const t = Math.min((performance.now() - startTime) / durationMs, 1);

            setGeospatialOrientation(camera, {
                yaw: startYaw + TWO_PI * ease(t),
                pitch: camera.pitch,
                radius: camera.radius,
                center: camera.center,
            });

            if (t >= 1) {
                const index = hooks.indexOf(onFrame);
                if (index >= 0) {
                    hooks.splice(index, 1);
                }
                resolve();
            }
        };

        hooks.push(onFrame);
    });
}
