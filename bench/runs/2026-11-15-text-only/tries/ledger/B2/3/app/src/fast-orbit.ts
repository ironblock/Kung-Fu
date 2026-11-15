import { attachControl, onBeforeRender } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drag speed multiplier relative to the library's default arc-rotate controls.
const DRAG_SCALE = 2;

function wrapAngle(a: number): number {
    const twoPi = Math.PI * 2;
    let r = (a + Math.PI) % twoPi;
    if (r < 0) r += twoPi;
    return r - Math.PI;
}

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, then doubles the alpha/beta motion they produce.
 *
 * Approach: the library's controls add their input and inertia to alpha/beta
 * after our per-frame hook runs (our hook is put at the head of the per-frame
 * list). At the start of each frame we measure how far the controls moved
 * alpha/beta since our last write, and add that same amount again. Every
 * frame's motion (drag and glide alike) is therefore applied twice. Radius is
 * never touched, so wheel and pinch zoom are left to the library.
 *
 * Returns a cleanup function that removes the canvas listeners and the
 * per-frame hook.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Library controls: canvas listeners plus a per-frame hook on the scene.
    // The library does not clean these up on scene dispose, so we call the
    // returned cleanup ourselves.
    const detachControls = attachControl(camera, canvas, scene);

    let lastAlpha = camera.alpha;
    let lastBeta = camera.beta;

    const boost = () => {
        // Motion the controls applied since our last write (last frame's input + inertia).
        const dAlpha = wrapAngle(camera.alpha - lastAlpha);
        const dBeta = camera.beta - lastBeta;
        const extra = DRAG_SCALE - 1;
        if (dAlpha !== 0) camera.alpha = camera.alpha + dAlpha * extra;
        if (dBeta !== 0) camera.beta = camera.beta + dBeta * extra;
        lastAlpha = camera.alpha;
        lastBeta = camera.beta;
    };

    // Assumed: returns a function that removes this callback from the list.
    const removeBoost = onBeforeRender(scene, boost) as unknown as () => void;

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        removeBoost();
        detachControls();
    };
}
