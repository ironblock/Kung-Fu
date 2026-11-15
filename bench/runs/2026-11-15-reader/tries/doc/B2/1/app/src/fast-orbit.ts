import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Same beta bounds the library's inertia step uses to keep the camera off the poles. */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse, touch and wheel controls, with
 * orbit turns doubled.
 *
 * The library accumulates drag input into `inertialAlphaOffset` / `inertialBetaOffset`
 * and applies (then decays) them once per frame in its own inertia step. Scaling the
 * input would not give exactly 2x, because the library snaps small offsets to zero
 * and the glide therefore stops at a different point. Instead this module measures
 * how far the library's own inertia step moved alpha and beta in each frame and adds
 * a second copy of that movement. The inertia state is never changed, so the drag
 * and the glide after release both turn exactly twice as far as the defaults.
 *
 * Wheel zoom, pinch zoom and panning are left to the library unchanged.
 *
 * The two per-frame hooks are placed on either side of the library's own inertia
 * hook in `scene._beforeRender`, and the returned cleanup removes both along with
 * the library's listeners.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const hooks = scene._beforeRender;
    let alphaBefore = 0;
    let betaBefore = 0;

    const beforeInertia = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    // Runs immediately after the library's inertia step for this frame.
    const afterInertia = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha !== 0) {
            camera.alpha = alphaBefore + 2 * dAlpha;
        }
        if (dBeta !== 0) {
            camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, betaBefore + 2 * dBeta));
        }
    };

    hooks.push(beforeInertia);
    const detachControls = attachControl(camera, canvas, scene);
    hooks.push(afterInertia);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        for (const hook of [beforeInertia, afterInertia]) {
            const idx = hooks.indexOf(hook);
            if (idx >= 0) {
                hooks.splice(idx, 1);
            }
        }
    };
}
