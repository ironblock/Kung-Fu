import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much farther a drag (and its glide) turns the camera than the library default does. */
const TURN_MULTIPLIER = 2;

/**
 * The library clamps beta to this range when it applies rotation inertia each frame. The values mirror that clamp,
 * so the scaled beta never goes past where the library's own controls would stop.
 */
const BETA_MIN = 0.01;
const BETA_MAX = Math.PI - 0.01;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`, with rotation (drag and glide)
 * scaled by {@link TURN_MULTIPLIER}.
 *
 * The library applies rotation once per frame from its inertia offsets. Each frame, this module records alpha and beta
 * just before that step and multiplies the change the library made by {@link TURN_MULTIPLIER}. Every applied step is
 * scaled exactly, so the total turn for a given mouse movement, including the glide after release, is exactly the
 * multiplier times the library default. (Scaling `angularSensibility` instead would not be exact: the library
 * snaps its inertia to zero below a fixed threshold, so the glide would not scale linearly.)
 *
 * Wheel zoom, panning, pinch, and keyboard behavior are untouched.
 *
 * @returns A cleanup function that removes the canvas listeners and both per-frame hooks. Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const hooksBefore = scene._beforeRender.length;
    const detachControls = attachControl(camera, canvas, scene);

    // attachControl registers exactly one per-frame hook when given a scene. It must sit right after the snapshot hook
    // and right before the scaling hook, so detect a different layout and fail early rather than scale the wrong step.
    if (scene._beforeRender.length !== hooksBefore + 1) {
        detachControls();
        throw new Error("attachFastOrbit: unexpected per-frame hook layout from attachControl");
    }

    let alphaBefore = 0;
    let betaBefore = 0;
    const snapshot = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };
    const scaleStep = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha !== 0) {
            camera.alpha = alphaBefore + dAlpha * TURN_MULTIPLIER;
        }
        if (dBeta !== 0) {
            const beta = betaBefore + dBeta * TURN_MULTIPLIER;
            camera.beta = Math.max(BETA_MIN, Math.min(BETA_MAX, beta));
        }
    };

    // Insert the snapshot directly before the library's inertia hook, and the scaling hook directly after it. Both
    // happen synchronously here, so nothing else can land between them.
    scene._beforeRender.splice(hooksBefore, 0, snapshot);
    scene._beforeRender.splice(hooksBefore + 2, 0, scaleStep);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        for (const hook of [snapshot, scaleStep]) {
            const index = scene._beforeRender.indexOf(hook);
            if (index >= 0) {
                scene._beforeRender.splice(index, 1);
            }
        }
    };
}
