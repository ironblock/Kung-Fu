import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Per-frame hook list on the scene. camera-notes.md (note 1) says Babylon Lite
// pushes its control hooks onto scene._beforeRender, but that member is not in
// the published declarations, so its element type is assumed here.
type BeforeRenderHook = () => void;
type SceneWithBeforeRender = SceneContext & { _beforeRender: BeforeRenderHook[] };

// Monotone, zero slope at both ends: the heading only ever increases.
function easeInOutSine(t: number): number {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw over
 * about `durationMs` of the scene's render loop, then restores the starting
 * heading exactly. Centre, pitch and radius are left as they are.
 * Resolves when the turn is complete.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    const startYaw = camera.yaw;

    if (!(durationMs > 0)) {
        camera.yaw = startYaw;
        return Promise.resolve();
    }

    const hooks = (scene as SceneWithBeforeRender)._beforeRender;

    return new Promise<void>((resolve) => {
        let startTime: number | undefined;

        const removeHook = (): void => {
            const index = hooks.indexOf(hook);
            if (index >= 0) {
                hooks.splice(index, 1);
            }
        };

        const hook = (): void => {
            const now = performance.now();
            if (startTime === undefined) {
                startTime = now;
            }
            const t = Math.min(1, (now - startTime) / durationMs);

            if (t >= 1) {
                camera.yaw = startYaw;
                removeHook();
                resolve();
                return;
            }

            camera.yaw = startYaw + TWO_PI * easeInOutSine(t);
        };

        hooks.push(hook);
    });
}
