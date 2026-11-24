import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Orbit-drag multiplier relative to the library's default controls. */
const DRAG_SCALE = 2;

// Same beta bounds the library's per-frame inertia step clamps to.
const BETA_MIN = 0.01;
const BETA_MAX = Math.PI - 0.01;

type FrameHook = (deltaMs: number) => void;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`, with
 * orbit drags turning the camera {@link DRAG_SCALE} times as far.
 *
 * The library's inertia step is wrapped: each frame the rotation it applies (alpha and
 * beta, including the glide after release) is measured and added once more. Because the
 * library's own offsets, decay and epsilon snapping are untouched, the total turn is
 * exactly `DRAG_SCALE` times the default for every drag, however small or slow.
 * Panning, pinch zoom and wheel zoom are left as the library defines them.
 *
 * Returns a cleanup function that detaches the library controls and the frame wrapper.
 * It is idempotent.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const hooks = scene._beforeRender;
    const countBefore = hooks.length;
    const detach = attachControl(camera, canvas, scene);
    if (hooks.length !== countBefore + 1) {
        detach();
        throw new Error("attachFastOrbit: expected attachControl to register one per-frame hook");
    }
    // attachControl pushes its inertia step last; wrap it in place.
    const libraryHook: FrameHook = hooks[hooks.length - 1]!;

    const fastHook: FrameHook = (deltaMs) => {
        const alpha0 = camera.alpha;
        const beta0 = camera.beta;
        libraryHook(deltaMs);

        const dAlpha = camera.alpha - alpha0;
        if (dAlpha !== 0) {
            camera.alpha = alpha0 + DRAG_SCALE * dAlpha;
        }
        const dBeta = camera.beta - beta0;
        if (dBeta !== 0) {
            camera.beta = Math.max(BETA_MIN, Math.min(BETA_MAX, beta0 + DRAG_SCALE * dBeta));
        }
    };
    hooks[hooks.length - 1] = fastHook;

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        // Put the library's hook back in place so its own cleanup can find and remove it.
        const index = hooks.indexOf(fastHook);
        if (index >= 0) {
            hooks[index] = libraryHook;
        }
        detach();
    };
}
