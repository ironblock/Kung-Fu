import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much farther a drag (and its glide) turns the camera than the default controls. */
const TURN_FACTOR = 2;

/** attachControl's inertia step keeps beta this far from 0 and from PI when it rotates. */
const BETA_EPSILON = 0.01;

type FrameHook = () => void;
type SceneWithHooks = SceneContext & { _beforeRender: FrameHook[] };

/** Smallest signed angle equivalent to `a`, in (-PI, PI]. Guards against alpha being wrapped. */
function shortestAngle(a: number): number {
    const twoPi = Math.PI * 2;
    let r = a % twoPi;
    if (r > Math.PI) r -= twoPi;
    else if (r <= -Math.PI) r += twoPi;
    return r;
}

/**
 * Gives `camera` the library's standard arc-rotate mouse/touch controls on `canvas`,
 * but every frame's rotation (drag and post-release inertia) is scaled by TURN_FACTOR.
 * Wheel/pinch zoom and panning are left exactly as the library does them.
 *
 * How: the library's attachControl applies all motion in one per-frame hook that it pushes
 * onto the tail of scene._beforeRender. We push a "before" hook just ahead of it and an
 * "after" hook just behind it, so the pair brackets exactly that hook. The change in
 * alpha/beta between the two is what the default controls turned this frame; the "after"
 * hook adds that change again (TURN_FACTOR - 1 more times).
 *
 * Returns a disposer that removes the library's listeners and hook and both of ours.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const hooks = (scene as SceneWithHooks)._beforeRender;

    let alphaBefore = 0;
    let betaBefore = 0;
    let armed = false;

    const before: FrameHook = () => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
        armed = true;
    };

    const after: FrameHook = () => {
        // If "before" was skipped this frame (e.g. a hook ahead of it spliced itself out
        // mid-loop), we have no valid snapshot, so do nothing rather than act on stale data.
        if (!armed) return;
        armed = false;

        const dAlpha = shortestAngle(camera.alpha - alphaBefore);
        const dBeta = camera.beta - betaBefore;
        const extra = TURN_FACTOR - 1;

        if (dAlpha !== 0) {
            camera.alpha = camera.alpha + dAlpha * extra;
        }
        if (dBeta !== 0) {
            const b = camera.beta + dBeta * extra;
            // Same clamp the library's inertia step uses whenever it applies rotation.
            camera.beta = Math.min(Math.max(b, BETA_EPSILON), Math.PI - BETA_EPSILON);
        }
    };

    hooks.push(before);
    const detachDefault = attachControl(camera, canvas, scene);
    hooks.push(after);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachDefault();
        for (const h of [before, after]) {
            const i = hooks.indexOf(h);
            if (i !== -1) hooks.splice(i, 1);
        }
        armed = false;
    };
}
