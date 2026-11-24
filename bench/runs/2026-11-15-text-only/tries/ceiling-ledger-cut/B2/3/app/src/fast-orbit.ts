import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an arc-rotate camera the library's standard mouse/touch controls,
 * except that every change to alpha and beta made by those controls (drag and
 * the inertial glide after release) is applied twice. Radius (wheel/pinch zoom)
 * and target are left exactly as the library sets them.
 *
 * How: we never re-implement the input handling. Instead we bracket each piece
 * of library control code with a "before" and an "after" snapshot of alpha/beta
 * and add the observed delta once more:
 *  - the per-frame hook attachControl appends to the tail of scene._beforeRender
 *    (glide, and any per-frame application of input), bracketed by two hooks of
 *    ours placed directly before and directly after it, so nothing else that
 *    runs in the frame (onBeforeRender callbacks, transitions) is doubled;
 *  - the canvas move listeners, bracketed by a capture listener registered
 *    before attachControl and a bubble listener registered after it, so ours
 *    run first and last for the same event.
 */

type FrameHook = (...args: unknown[]) => unknown;
type SceneInternals = { _beforeRender: FrameHook[] };

const MOVE_EVENTS = ["pointermove", "mousemove", "touchmove"] as const;
const FACTOR = 2;
// Keep doubled beta off the poles, so doubling cannot flip the view over the top.
const BETA_EPS = 1e-4;

export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const list = (scene as unknown as SceneInternals)._beforeRender;

    let snapAlpha = camera.alpha;
    let snapBeta = camera.beta;
    let snapped = false;

    const before = (): void => {
        snapAlpha = camera.alpha;
        snapBeta = camera.beta;
        snapped = true;
    };

    const after = (): void => {
        if (!snapped) return;
        snapped = false;
        const dAlpha = camera.alpha - snapAlpha;
        const dBeta = camera.beta - snapBeta;
        const extra = FACTOR - 1;
        if (dAlpha !== 0) {
            camera.alpha = camera.alpha + dAlpha * extra;
        }
        if (dBeta !== 0) {
            const cur = camera.beta;
            let beta = cur + dBeta * extra;
            if (cur > 0 && cur < Math.PI) {
                beta = Math.min(Math.max(beta, BETA_EPS), Math.PI - BETA_EPS);
            }
            camera.beta = beta;
        }
    };

    // "before" listeners: capture phase, registered before the library's.
    for (const type of MOVE_EVENTS) {
        canvas.addEventListener(type, before, { capture: true });
    }

    const lengthBefore = list.length;
    let detachLibrary: unknown;
    try {
        detachLibrary = attachControl(camera, canvas, scene);
    } catch (err) {
        for (const type of MOVE_EVENTS) {
            canvas.removeEventListener(type, before, { capture: true });
        }
        throw err;
    }

    // "after" listeners: bubble phase, registered after the library's.
    for (const type of MOVE_EVENTS) {
        canvas.addEventListener(type, after);
    }

    // Bracket the per-frame hook(s) attachControl appended at the tail.
    const frameBefore: FrameHook = () => before();
    const frameAfter: FrameHook = () => after();
    const added = list.slice(lengthBefore);
    if (added.length > 0) {
        const first = list.indexOf(added[0]!, lengthBefore);
        const last = list.indexOf(added[added.length - 1]!, lengthBefore);
        list.splice(last + 1, 0, frameAfter);
        list.splice(first, 0, frameBefore);
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        if (typeof detachLibrary === "function") {
            (detachLibrary as () => void)();
        }
        for (const type of MOVE_EVENTS) {
            canvas.removeEventListener(type, before, { capture: true });
            canvas.removeEventListener(type, after);
        }
        for (const hook of [frameBefore, frameAfter]) {
            const i = list.indexOf(hook);
            if (i !== -1) list.splice(i, 1);
        }
    };
}
