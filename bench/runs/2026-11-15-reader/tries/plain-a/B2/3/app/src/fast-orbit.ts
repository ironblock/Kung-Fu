import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Cameras that currently have fast orbit attached (guards against double attach). */
const attached = new WeakSet<ArcRotateCamera>();

/** Beta limits the library clamps to during its rotation step (see arc-rotate-controls). */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard mouse and touch orbit controls to `camera`, with
 * drag rotation running twice as fast.
 *
 * The library applies inertial rotation once per frame from its `_beforeRender`
 * hook, and the glide after release is that same process. This function brackets
 * the library's hook: it records alpha/beta just before the library's rotation
 * step and, right after it, applies the realized change a second time. Every
 * frame's rotation is therefore exactly double the library's, drag and glide
 * alike, with the library's own input handling, decay and clamping untouched.
 *
 * Wheel zoom, pinch zoom and right-button panning are left as the library
 * implements them. Input sensibility is not modified.
 *
 * @returns A cleanup function that removes the canvas listeners and both
 * per-frame hooks. Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    if (attached.has(camera)) {
        throw new Error("attachFastOrbit: this camera already has fast orbit attached");
    }
    attached.add(camera);

    let alphaBefore = 0;
    let betaBefore = 0;

    // Runs before the library's rotation step (registered first, see below).
    const captureBeforeRotation = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    // Runs after the library's rotation step. Applies the same realized change again.
    const applyRotationAgain = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha !== 0) {
            camera.alpha += dAlpha;
        }
        if (dBeta !== 0) {
            camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, camera.beta + dBeta));
        }
    };

    const hooks = scene._beforeRender;
    hooks.push(captureBeforeRotation);
    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        hooks.splice(hooks.indexOf(captureBeforeRotation), 1);
        attached.delete(camera);
        throw err;
    }
    hooks.push(applyRotationAgain);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        for (const hook of [captureBeforeRotation, applyRotationAgain]) {
            const index = hooks.indexOf(hook);
            if (index >= 0) {
                hooks.splice(index, 1);
            }
        }
        attached.delete(camera);
    };
}
