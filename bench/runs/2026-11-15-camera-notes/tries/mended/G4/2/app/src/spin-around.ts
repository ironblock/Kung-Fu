import {
    normalizeRadians,
    setGeospatialOrientation,
} from "@babylonjs/lite";
import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: 0 at t=0, 1 at t=1, monotonic in between (ease in and out).
function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

// The render-loop hook is not in the type declarations I was given. The notes
// say attachControl registers its per-frame work on scene._beforeRender, so this
// assumes that property is an array of no-argument callbacks run once per frame.
type BeforeRenderHost = { _beforeRender: Array<() => void> };

/**
 * Turns the camera once around its vertical axis, eastward (increasing yaw),
 * over about `durationMs` of the scene's render loop. Centre, pitch and radius
 * are left as they are; the final yaw equals the starting yaw.
 * Resolves when the turn is complete.
 */
export function spinAround(
    camera: GeospatialCamera,
    scene: SceneContext,
    durationMs: number,
): Promise<void> {
    const startYaw = camera.yaw;

    return new Promise<void>((resolve) => {
        const hooks = (scene as unknown as BeforeRenderHost)._beforeRender;
        let startTime: number | undefined;
        let done = false;

        const finish = () => {
            done = true;
            const index = hooks.indexOf(frame);
            if (index >= 0) hooks.splice(index, 1);
        };

        const frame = () => {
            if (done) return;

            const now = performance.now();
            if (startTime === undefined) startTime = now;
            const t = durationMs > 0 ? Math.min(1, (now - startTime) / durationMs) : 1;

            // Re-read pitch, radius and centre each frame so any zoom or tilt
            // the user makes during the spin is kept rather than overwritten.
            const yaw = t >= 1
                ? normalizeRadians(startYaw)
                : normalizeRadians(startYaw + TWO_PI * easeInOut(t));

            setGeospatialOrientation(camera, {
                yaw,
                pitch: camera.pitch,
                radius: camera.radius,
                center: camera.center,
            });

            if (t >= 1) {
                finish();
                resolve();
            }
        };

        hooks.push(frame);
    });
}
