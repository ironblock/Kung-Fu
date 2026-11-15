import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: starts and ends with zero rate, and never decreases.
function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

// The per-frame hook list. attachControl pushes its hook here, so this is the
// render loop's before-render list. Not part of the declared SceneContext type,
// so it is reached through a cast.
type BeforeRenderHooks = Array<() => void>;

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw over
 * about `durationMs` of the scene's render loop. Centre, pitch and radius are
 * left alone. The camera ends with the heading it started with.
 * Resolves when the turn is complete.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const startYaw = camera.yaw;
    const hooks = (scene as unknown as { _beforeRender: BeforeRenderHooks })._beforeRender;

    return new Promise<void>((resolve) => {
        let startTime: number | undefined;

        const tick = (): void => {
            const now = performance.now();
            if (startTime === undefined) {
                startTime = now;
            }
            const t = durationMs > 0 ? Math.min(1, (now - startTime) / durationMs) : 1;

            if (t >= 1) {
                // Write the exact starting heading so the turn ends where it began.
                camera.yaw = startYaw;
                const index = hooks.indexOf(tick);
                if (index >= 0) {
                    hooks.splice(index, 1);
                }
                resolve();
                return;
            }

            // Unwrapped offset, so the heading only ever increases. The camera
            // wraps its own yaw into [-PI, PI), which is fine for the view.
            camera.yaw = startYaw + TWO_PI * easeInOut(t);
        };

        hooks.push(tick);
    });
}
