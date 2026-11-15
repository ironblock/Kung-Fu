import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Same beta bounds the library's inertia step clamps to. */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse and touch controls, with orbit
 * turning doubled.
 *
 * The library accumulates pointer input into `inertialAlphaOffset` /
 * `inertialBetaOffset` and applies (then decays) them once per frame in its
 * inertia step. Its decay stops below an absolute threshold, so changing the
 * sensitivity would not double the glide exactly. Instead this leaves the
 * library's offsets alone and bracket its per-frame inertia step: a hook before
 * it records alpha/beta, and a hook after it applies one more copy of the
 * rotation the library just applied. The library therefore turns the camera
 * exactly twice as far in every frame, for drag and glide alike. Pan, wheel
 * zoom, and pinch are not touched.
 *
 * Both hooks are pushed onto `scene._beforeRender` directly around the library's
 * hook, so they run immediately before and after it.
 *
 * @returns Cleanup that removes the canvas listeners, the library's inertia hook,
 *   and both bracketing hooks. Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    const before = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    const after = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        if (dAlpha !== 0) {
            camera.alpha = alphaBefore + 2 * dAlpha;
        }
        const dBeta = camera.beta - betaBefore;
        if (dBeta !== 0) {
            camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, betaBefore + 2 * dBeta));
        }
    };

    // Pushed in this order and with nothing in between, so `before` sits directly
    // ahead of the library's applyInertia and `after` directly behind it.
    scene._beforeRender.push(before);
    const detachControl = attachControl(camera, canvas, scene);
    scene._beforeRender.push(after);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControl();
        for (const hook of [before, after]) {
            const idx = scene._beforeRender.indexOf(hook);
            if (idx >= 0) {
                scene._beforeRender.splice(idx, 1);
            }
        }
    };
}
