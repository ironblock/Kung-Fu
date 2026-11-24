import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much farther a drag turns the camera than the library's standard controls. */
const DRAG_TURN_FACTOR = 2;

/** Beta limits used by the library's inertia step (kept in sync with arc-rotate-controls). */
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`, except that
 * a drag turns the camera {@link DRAG_TURN_FACTOR} times as far for the same pointer movement.
 *
 * How it works: the library turns the camera in its per-frame inertia step (`applyInertia`,
 * run from `scene._beforeRender`). That step moves alpha/beta by the decaying drag offsets,
 * so the drag and the glide after release both come from it. We bracket that step with two
 * per-frame hooks: one records alpha/beta just before it runs, the other adds the extra
 * `(DRAG_TURN_FACTOR - 1)` times the movement it made just after. The library's offsets,
 * decay and cutoffs are untouched, so the total turn (drag and glide) is exactly
 * `DRAG_TURN_FACTOR` times the standard one. Wheel zoom, pinch zoom and panning are not
 * affected, since only alpha and beta are scaled.
 *
 * The returned function detaches the controls and removes both hooks, so nothing of ours
 * runs per frame afterwards. It is idempotent.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const extraFactor = DRAG_TURN_FACTOR - 1;
    let alphaBefore = 0;
    let betaBefore = 0;

    // Runs immediately before the library's inertia step.
    const measureBefore = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    // Runs immediately after it; adds the extra share of whatever it just moved.
    const addExtraTurn = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha !== 0) {
            camera.alpha += dAlpha * extraFactor;
        }
        if (dBeta !== 0) {
            camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, camera.beta + dBeta * extraFactor));
        }
    };

    // Registration order matters: the pre-hook must precede the library's inertia hook, which
    // attachControl pushes synchronously, and the post-hook must follow it.
    scene._beforeRender.push(measureBefore);
    const detachControls = attachControl(camera, canvas, scene);
    scene._beforeRender.push(addExtraTurn);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        removeHook(scene, measureBefore);
        removeHook(scene, addExtraTurn);
    };
}

function removeHook(scene: SceneContext, hook: (deltaMs: number) => void): void {
    const idx = scene._beforeRender.indexOf(hook);
    if (idx >= 0) {
        scene._beforeRender.splice(idx, 1);
    }
}
