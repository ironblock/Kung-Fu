import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard arc-rotate mouse/touch controls, but make drag
 * rotation (including the inertial glide after release) turn the camera twice
 * as far. Wheel zoom, pinch zoom and panning are left exactly as the library
 * does them.
 *
 * How: the library applies `inertialAlphaOffset` / `inertialBetaOffset` to
 * alpha/beta once per frame inside its `_beforeRender` hook, then decays them.
 * We bracket that hook with our own pre/post hooks, measure the alpha/beta
 * step it just applied, and apply the same step a second time. Because the
 * library's offsets, decay and snap-to-zero sequence are untouched, every
 * frame of the drag and glide turns exactly twice as far (handedness is
 * handled by the library, since we only repeat the measured step).
 *
 * @returns Cleanup that removes all canvas listeners and all per-frame hooks.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const ROTATION_MULTIPLIER = 2;
    const BETA_EPSILON = 0.01; // same pole clamp the library applies

    let rotating = false;
    let alphaBefore = 0;
    let betaBefore = 0;

    const before = (): void => {
        // Same condition the library uses to decide whether to rotate this frame.
        rotating = camera.inertialAlphaOffset !== 0 || camera.inertialBetaOffset !== 0;
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    const after = (): void => {
        if (!rotating) {
            return;
        }
        rotating = false;
        const extra = ROTATION_MULTIPLIER - 1;
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha !== 0) {
            camera.alpha += dAlpha * extra;
        }
        if (dBeta !== 0) {
            camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, camera.beta + dBeta * extra));
        }
    };

    // Pushed synchronously around attachControl so the order is exactly
    // [before, library inertia hook, after].
    scene._beforeRender.push(before);
    const detachLibrary = attachControl(camera, canvas, scene);
    scene._beforeRender.push(after);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachLibrary();
        for (const hook of [before, after]) {
            const i = scene._beforeRender.indexOf(hook);
            if (i >= 0) {
                scene._beforeRender.splice(i, 1);
            }
        }
    };
}
