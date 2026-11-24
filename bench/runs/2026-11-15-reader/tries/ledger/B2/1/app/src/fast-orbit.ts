import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// attachControl clamps beta to this margin from 0 and pi whenever its inertia step applies rotation.
const BETA_EPSILON = 0.01;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`, with orbit
 * turns doubled. Zoom (wheel and pinch) and panning are unchanged.
 *
 * The library applies orbit input once per frame from its inertia step and decays the offset
 * with a snap-to-zero threshold, so scaling the input would not give an exact doubling of the
 * glide. Instead, two frame hooks bracket the library's inertia hook: the first records alpha
 * and beta, the second adds the step the library just applied once more. Each frame's step,
 * and so the whole drag and glide, comes out at exactly twice the default.
 *
 * Returns a function that removes the canvas listeners and both frame hooks. It is idempotent.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    // Pushed to the tail of scene._beforeRender just before attachControl pushes its inertia hook.
    const sample = (): void => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    // Pushed just after attachControl's inertia hook, so it sees the step that hook applied this frame.
    const boost = (): void => {
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
    hooks.push(sample);
    const detachControls = attachControl(camera, canvas, scene);
    hooks.push(boost);

    return () => {
        detachControls();
        for (const hook of [sample, boost]) {
            const index = hooks.indexOf(hook);
            if (index >= 0) {
                hooks.splice(index, 1);
            }
        }
    };
}
