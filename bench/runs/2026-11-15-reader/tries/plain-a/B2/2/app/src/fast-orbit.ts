import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Beta bounds used by the library's inertia step (kept in sync with it). */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse/touch controls to `camera`,
 * with all orbit rotation (drag and the post-release glide) turning the camera
 * twice as far as the defaults. Wheel zoom and pan are left exactly as the
 * library does them.
 *
 * How it works: the library accumulates drag into `inertialAlphaOffset` /
 * `inertialBetaOffset` and applies/decays them once per frame from a
 * `scene._beforeRender` hook. Halving `angularSensibility` would double the drag
 * but not the glide, because the library's decay snaps small offsets to zero at
 * an absolute threshold. Instead, a hook runs before the library's per-frame
 * step and another runs after it; the second one measures how far the library
 * just turned the camera and applies that same amount again. Every frame of
 * rotation is therefore exactly doubled, including the glide.
 *
 * @returns A cleanup function that removes the canvas listeners and both
 * per-frame hooks. Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    const captureRotation = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    const applyExtraRotation = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha === 0 && dBeta === 0) {
            return;
        }
        camera.alpha += dAlpha;
        camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, camera.beta + dBeta));
    };

    // Registered before and after the library's own inertia hook, so that
    // applyInertia runs between them. Both hooks are removed on cleanup.
    scene._beforeRender.push(captureRotation);
    const detachControls = attachControl(camera, canvas, scene);
    scene._beforeRender.push(applyExtraRotation);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        removeHook(scene, captureRotation);
        removeHook(scene, applyExtraRotation);
    };
}

function removeHook(scene: SceneContext, hook: () => void): void {
    const index = scene._beforeRender.indexOf(hook);
    if (index >= 0) {
        scene._beforeRender.splice(index, 1);
    }
}
