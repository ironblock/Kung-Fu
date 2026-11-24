import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How many times farther a drag turns the camera than the library's default controls do. */
const DRAG_SPEED_FACTOR = 2;

/** Same beta bounds the library's inertia step uses (see `applyInertia` in arc-rotate-controls). */
const BETA_EPSILON = 0.01;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to `camera`, with
 * orbit drags turning the camera {@link DRAG_SPEED_FACTOR} times as far.
 *
 * The library does all the work: pointer deltas, inertia offsets and their decay are
 * unchanged, so the glide after release follows the same curve as the default. Each
 * frame, after the library has applied its rotation, this module applies the same
 * rotation once more. The result is exactly `DRAG_SPEED_FACTOR` times the default
 * rotation, drag and glide alike. Wheel zoom, pinch zoom and right-button panning
 * are not touched.
 *
 * @returns A cleanup function that removes the canvas listeners and both per-frame hooks.
 * Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    // Runs immediately before the library's inertia step, which is pushed by attachControl below.
    const captureBefore = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    // Runs immediately after the library's inertia step and adds the same rotation again.
    const addExtraRotation = (): void => {
        const dAlpha = camera.alpha - alphaBefore;
        const dBeta = camera.beta - betaBefore;
        if (dAlpha === 0 && dBeta === 0) {
            return;
        }
        camera.alpha += (DRAG_SPEED_FACTOR - 1) * dAlpha;
        const beta = camera.beta + (DRAG_SPEED_FACTOR - 1) * dBeta;
        camera.beta = Math.max(BETA_EPSILON, Math.min(Math.PI - BETA_EPSILON, beta));
    };

    scene._beforeRender.push(captureBefore);
    const detachControls = attachControl(camera, canvas, scene);
    scene._beforeRender.push(addExtraRotation);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        removeHook(scene, captureBefore);
        removeHook(scene, addExtraRotation);
    };
}

function removeHook(scene: SceneContext, hook: () => void): void {
    const index = scene._beforeRender.indexOf(hook as (deltaMs: number) => void);
    if (index >= 0) {
        scene._beforeRender.splice(index, 1);
    }
}
