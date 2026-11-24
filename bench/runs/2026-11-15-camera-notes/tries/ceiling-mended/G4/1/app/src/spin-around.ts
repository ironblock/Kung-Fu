import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

/**
 * The most time one frame may add to the spin. If the render loop stalls or the
 * tab is hidden, the spin carries on from where it was instead of jumping ahead.
 * With durations of 1 s or more, this also keeps every step under 1 rad, so the
 * turn never looks like it went backward.
 */
const MAX_FRAME_MS = 100;

/** A heading change larger than this between two of our frames means something else turned the camera. */
const YAW_TOLERANCE = 1e-6;

/** Wraps an angle into [-PI, PI), the range GeospatialCamera keeps yaw in. */
function wrapAngle(angle: number): number {
    return angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI);
}

/** Cosine ease-in-out. It never decreases on [0, 1], so the heading only moves forward. */
function easeInOut(t: number): number {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw, over about
 * `durationMs` of the scene's render loop. The camera ends at the heading it had
 * on the first frame of the spin. Centre, pitch and radius are never written.
 *
 * If something else changes yaw during the spin (a right-drag from
 * attachGeospatialControls, a fly, another spinAround), the spin stops where it is
 * and the promise resolves. This works like flyGeospatialCameraToAsync, which also
 * resolves when it is interrupted.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
        return Promise.reject(new RangeError(`spinAround: durationMs must be a finite number >= 0, got ${durationMs}`));
    }

    // The declarations I have don't include SceneContext. The camera notes say
    // attachControl drives its per-frame work through a hook pushed on
    // scene._beforeRender, so this uses the same mechanism.
    const hooks = (scene as unknown as { _beforeRender?: unknown })._beforeRender;
    if (!Array.isArray(hooks)) {
        return Promise.reject(new TypeError("spinAround: scene._beforeRender is not an array, cannot hook into the render loop"));
    }
    const frameHooks = hooks as Array<() => void>;

    return new Promise<void>((resolve) => {
        let started = false;
        let finished = false;
        let startYaw = 0;
        let expectedYaw = 0;
        let elapsedMs = 0;
        let lastTime = performance.now();

        const finish = (): void => {
            finished = true;
            // Removing the hook waits until the scene has finished going through its
            // hooks for this frame, so splicing doesn't make it skip the next hook.
            queueMicrotask(() => {
                const index = frameHooks.indexOf(onFrame);
                if (index !== -1) frameHooks.splice(index, 1);
            });
            resolve();
        };

        const onFrame = (): void => {
            if (finished) return;

            const now = performance.now();
            elapsedMs += Math.min(Math.max(now - lastTime, 0), MAX_FRAME_MS);
            lastTime = now;

            if (!started) {
                // A heading change made before the first frame becomes the start.
                started = true;
                startYaw = camera.yaw;
                expectedYaw = startYaw;
            } else if (Math.abs(wrapAngle(camera.yaw - expectedYaw)) > YAW_TOLERANCE) {
                finish();
                return;
            }

            // Progress is tracked here, never read back from camera.yaw. The camera
            // wraps yaw into [-PI, PI), so the value it reports can't tell us how far
            // the turn has gone.
            const t = durationMs > 0 ? Math.min(elapsedMs / durationMs, 1) : 1;
            camera.yaw = t < 1 ? wrapAngle(startYaw + TWO_PI * easeInOut(t)) : startYaw;
            expectedYaw = camera.yaw;

            if (t >= 1) finish();
        };

        frameHooks.push(onFrame);
    });
}
