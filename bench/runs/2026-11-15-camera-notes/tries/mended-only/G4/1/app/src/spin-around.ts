import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: 0 maps to 0, 1 maps to 1, eases in and out, and never decreases.
function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

type FrameHook = () => void;

// Adds a callback to the scene's per-frame loop and returns a function that removes it.
// This goes through scene._beforeRender, the array that attachControl pushes its hook onto
// (per camera-notes.md). It is not a documented public API, so check it against the library.
function addFrameHook(scene: SceneContext, hook: FrameHook): () => void {
    const hooks = (scene as unknown as { _beforeRender: FrameHook[] })._beforeRender;
    hooks.push(hook);
    return () => {
        const index = hooks.indexOf(hook);
        if (index >= 0) {
            hooks.splice(index, 1);
        }
    };
}

/**
 * Turns the camera's heading (yaw) one full turn eastward over about durationMs of the
 * render loop, then leaves it at the heading it started with. Centre, pitch (tilt) and
 * radius (zoom) are not touched.
 *
 * GeospatialCamera wraps yaw to [-PI, PI), so the value is written unwrapped (startYaw + 2PI * e)
 * and the setter does the wrapping. Yaw therefore only ever increases during the turn, and
 * the final write is the exact start value.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
        const startYaw = camera.yaw;

        if (!(durationMs > 0)) {
            camera.yaw = startYaw;
            resolve();
            return;
        }

        // The clock starts on the first frame, not when this function is called,
        // so a scene that has not started rendering yet does not lose part of the turn.
        let startTime: number | undefined;
        let removeHook: () => void = () => {};

        const frame = () => {
            const now = performance.now();
            if (startTime === undefined) {
                startTime = now;
            }
            const t = Math.min(1, (now - startTime) / durationMs);

            if (t >= 1) {
                removeHook();
                camera.yaw = startYaw;
                resolve();
                return;
            }

            camera.yaw = startYaw + TWO_PI * easeInOut(t);
        };

        removeHook = addFrameHook(scene, frame);
    });
}
