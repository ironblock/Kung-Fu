import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Ease in and out. Maps 0 to 0 and 1 to 1 and never decreases in between.
function easeInOutSine(t: number): number {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

type BeforeRenderHook = () => void;

// ASSUMPTION (not verified against the library): scene._beforeRender is an
// array of per-frame callbacks. The Babylon Lite typings for SceneContext were
// not available, so this is the one place to adjust if the hook shape differs.
function addBeforeRender(scene: SceneContext, hook: BeforeRenderHook): () => void {
    const hooks = (scene as unknown as { _beforeRender: BeforeRenderHook[] })._beforeRender;
    hooks.push(hook);
    return () => {
        const i = hooks.indexOf(hook);
        if (i >= 0) hooks.splice(i, 1);
    };
}

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw over
 * about `durationMs`, easing in and out. Only yaw is written: center, pitch and
 * radius are left as they are. Resolves once the turn is complete.
 *
 * The turn starts on the first rendered frame after the call. Yaw is written
 * unwrapped, so it only ever increases; the final yaw is the starting yaw + 2π,
 * which is the same heading as the starting yaw.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
        if (!(durationMs > 0)) {
            resolve();
            return;
        }

        // Stop any fly-to animation that would also write yaw.
        camera._cancelFly?.();

        const startYaw = camera.yaw;
        let startTime: number | undefined;
        let remove: (() => void) | undefined;

        const frame = (): void => {
            const now = performance.now();
            if (startTime === undefined) startTime = now;
            const t = Math.min(1, (now - startTime) / durationMs);

            camera.yaw = startYaw + TWO_PI * easeInOutSine(t);

            if (t >= 1) {
                remove?.();
                resolve();
            }
        };

        remove = addBeforeRender(scene, frame);
    });
}
