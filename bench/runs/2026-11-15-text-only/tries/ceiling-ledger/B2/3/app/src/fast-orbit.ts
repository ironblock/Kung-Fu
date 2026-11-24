import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much farther a drag (and its glide) turns the camera than the default controls. */
const TURN_FACTOR = 2;

type FrameHook = () => void;

/**
 * Attaches the library's standard arc-rotate mouse/touch controls, then doubles
 * every alpha/beta change those controls make (drag and post-release inertia).
 * Radius (wheel / pinch zoom) and target (pan) are left exactly as the library sets them.
 *
 * How: the library's controls apply input and inertia in a per-frame hook that it
 * appends to scene._beforeRender. We put one hook of ours directly before it and one
 * directly after it. The "before" hook records alpha/beta; the "after" hook sees exactly
 * what the controls changed in this frame and applies that change once more. Because
 * nothing else sits between our two hooks, app writes, onBeforeRender callbacks and
 * camera interpolations are never doubled.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const list = (scene as unknown as { _beforeRender: FrameHook[] })._beforeRender;

    const before = list.slice();
    const detachControls = attachControl(camera, canvas, scene);
    const controlsHook = list.find((cb) => !before.includes(cb));
    if (!controlsHook) {
        detachControls();
        throw new Error("attachFastOrbit: could not find the arc-rotate control hook on the scene");
    }

    let alphaBefore = camera.alpha;
    let betaBefore = camera.beta;

    const recordHook: FrameHook = () => {
        alphaBefore = camera.alpha;
        betaBefore = camera.beta;
    };

    const amplifyHook: FrameHook = () => {
        let dAlpha = camera.alpha - alphaBefore;
        // Tolerate the controls wrapping alpha into a fixed range.
        if (dAlpha > Math.PI) dAlpha -= 2 * Math.PI;
        else if (dAlpha < -Math.PI) dAlpha += 2 * Math.PI;
        const dBeta = camera.beta - betaBefore;

        const extra = TURN_FACTOR - 1;
        if (dAlpha !== 0) {
            camera.alpha = camera.alpha + dAlpha * extra;
        }
        if (dBeta !== 0) {
            // Keep beta strictly inside (0, pi) so the extra turn cannot flip the camera
            // over a pole the default controls would have stopped at.
            const eps = 1e-3;
            const lo = Math.min(eps, camera.beta);
            const hi = Math.max(Math.PI - eps, camera.beta);
            const next = Math.min(hi, Math.max(lo, camera.beta + dBeta * extra));
            if (next !== camera.beta) camera.beta = next;
        }
    };

    // Place our hooks immediately around the controls hook.
    const idx = list.indexOf(controlsHook);
    list.splice(idx + 1, 0, amplifyHook);
    list.splice(idx, 0, recordHook);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        for (const hook of [recordHook, amplifyHook]) {
            const i = list.indexOf(hook);
            if (i >= 0) list.splice(i, 1);
        }
        detachControls();
    };
}
