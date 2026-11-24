import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Pointer/touch move events that the library's drag handling may listen to.
 * Only the change a move makes to the rotation offsets is ever touched, so
 * listening to all of them is harmless when the library uses just one.
 */
const MOVE_EVENTS = ["pointermove", "mousemove", "touchmove"] as const;

/** How much further a drag turns the camera than the library's default. */
const DRAG_GAIN = 2;

/**
 * Attaches the library's standard mouse and touch controls to an arc-rotate
 * camera, with drag rotation (including the post-release glide) doubled.
 *
 * How it works: the library's drag handler adds each move's rotation to
 * inertialAlphaOffset / inertialBetaOffset, and the per-frame step applies
 * and decays those offsets. Because that step is linear, scaling each move's
 * contribution by DRAG_GAIN scales both the direct turn and the glide.
 *
 * For every move event, a capture-phase listener on window records the offsets
 * before the library's handler runs, and a bubble-phase listener on window
 * (registered after the library's) scales the change the handler made. Frame
 * decay happens outside event dispatch, so it is never scaled. Wheel and key
 * input are not affected.
 *
 * @returns a function that removes the controls and every listener this added.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detachLibrary = camera.attachControl(canvas, undefined, scene);

    const pending = { active: false, alpha: 0, beta: 0 };

    const capture = (): void => {
        pending.active = true;
        pending.alpha = camera.inertialAlphaOffset;
        pending.beta = camera.inertialBetaOffset;
    };

    const boost = (): void => {
        if (!pending.active) {
            return;
        }
        pending.active = false;
        const alphaChange = camera.inertialAlphaOffset - pending.alpha;
        const betaChange = camera.inertialBetaOffset - pending.beta;
        camera.inertialAlphaOffset = pending.alpha + DRAG_GAIN * alphaChange;
        camera.inertialBetaOffset = pending.beta + DRAG_GAIN * betaChange;
    };

    for (const type of MOVE_EVENTS) {
        window.addEventListener(type, capture, { capture: true, passive: true });
        window.addEventListener(type, boost, { capture: false, passive: true });
    }

    return () => {
        for (const type of MOVE_EVENTS) {
            window.removeEventListener(type, capture, { capture: true });
            window.removeEventListener(type, boost, { capture: false });
        }
        pending.active = false;
        detachLibrary();
    };
}
