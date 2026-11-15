import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Same beta margin the library's inertia loop keeps from the poles. */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`,
 * with orbit (alpha/beta) motion doubled.
 *
 * The library accumulates each drag into inertial offsets and applies them once
 * per frame, decaying the offsets afterwards. The drag and the post-release glide
 * both go through that per-frame step. This function leaves the library's input
 * and decay untouched, and doubles only the alpha/beta change the library applies
 * in each frame: the step is captured before the library's inertia hook runs and
 * the extra half-step is added after it. Because the decay sequence is the library's
 * own, the doubled glide is exactly twice the default glide, including where the
 * library snaps the tail to zero. Panning and wheel zoom are not changed.
 *
 * The returned function removes every canvas listener and both per-frame hooks.
 * It is safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    // Runs before the library's inertia hook, which is pushed by attachControl below.
    const captureOrbit = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    // Runs right after the library's inertia hook: add one more copy of the step it applied.
    const doubleOrbitStep = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha !== 0) {
            camera.alpha = alphaBefore + 2 * dAlpha;
        }
        if (dBeta !== 0) {
            const beta = betaBefore + 2 * dBeta;
            camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, beta));
        }
    };

    scene._beforeRender.push(captureOrbit);
    const detachControls = attachControl(camera, canvas, scene);
    scene._beforeRender.push(doubleOrbitStep);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        removeHook(scene, captureOrbit);
        removeHook(scene, doubleOrbitStep);
    };
}

function removeHook(scene: SceneContext, hook: () => void): void {
    const idx = scene._beforeRender.indexOf(hook);
    if (idx >= 0) {
        scene._beforeRender.splice(idx, 1);
    }
}
