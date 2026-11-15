import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How many times further a drag turns the camera than the library default. */
const ROTATION_MULTIPLIER = 2;

/** Events during which the library's controls turn a drag into rotation. */
const MOVE_EVENTS = ["pointermove", "touchmove"] as const;

/**
 * Attach the library's standard arc-rotate mouse/touch controls, but make
 * drag rotation (both axes, including the post-release glide) twice as strong.
 *
 * The library's `attachControl` has no angular-sensibility option. Its drag
 * handler only adds `-dx / 1000` and `-dy / 1000` to
 * `camera.inertialAlphaOffset` / `camera.inertialBetaOffset`; the per-frame
 * `applyInertia` then applies and decays those offsets. That pipeline is linear,
 * so doubling every amount the drag handler adds doubles both the direct turn
 * and the glide.
 *
 * To do that we record the two offsets in a listener registered *before*
 * `attachControl` and, in a listener registered *after* it, add the change again
 * (listeners on one target run in registration order). Panning and zoom do not
 * touch these two offsets, so they stay exactly as the library does them.
 * Nothing of ours runs per frame.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let alphaBefore = 0;
    let betaBefore = 0;

    const before = (): void => {
        alphaBefore = camera.inertialAlphaOffset;
        betaBefore = camera.inertialBetaOffset;
    };

    const after = (): void => {
        const dAlpha = camera.inertialAlphaOffset - alphaBefore;
        const dBeta = camera.inertialBetaOffset - betaBefore;
        if (dAlpha !== 0) camera.inertialAlphaOffset += dAlpha * (ROTATION_MULTIPLIER - 1);
        if (dBeta !== 0) camera.inertialBetaOffset += dBeta * (ROTATION_MULTIPLIER - 1);
    };

    for (const type of MOVE_EVENTS) canvas.addEventListener(type, before);
    const detachLibrary = attachControl(camera, canvas, scene);
    for (const type of MOVE_EVENTS) canvas.addEventListener(type, after);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        for (const type of MOVE_EVENTS) {
            canvas.removeEventListener(type, before);
            canvas.removeEventListener(type, after);
        }
        detachLibrary();
    };
}
