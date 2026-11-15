import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Rotation multiplier relative to the library's default orbit controls.
 *
 * The library's pointer handler adds its rotation for each move to
 * camera.inertialAlphaOffset / inertialBetaOffset, and the inertia step then
 * integrates and decays those offsets. Adding EXTRA times the library's own
 * per-move increment doubles the drag, and because the glide is the decayed sum
 * of the same offsets, it doubles too. Wheel zoom writes only inertialRadiusOffset
 * and pan writes only the panning offsets, so neither is affected.
 */
const DRAG_GAIN = 2;
const EXTRA = DRAG_GAIN - 1;

const MOVE_EVENTS = ["pointermove", "touchmove"] as const;

/**
 * Attach the library's standard ArcRotate mouse/touch controls to `canvas`, with
 * orbit drags turning the camera DRAG_GAIN times as far as the defaults.
 * Returns a function that removes every listener this attaches.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    let beforeAlpha = 0;
    let beforeBeta = 0;

    // The "before" listener is registered in capture phase before attachControl, and
    // the "after" listener in bubble phase after it. Both sit on the canvas, so the
    // library's handler for the same event runs between them and its write to the
    // inertial offsets is the only change in that window. Inertia decay runs in the
    // frame loop, never inside these event dispatches, so the measured delta is pure input.
    const onBefore = (): void => {
        beforeAlpha = camera.inertialAlphaOffset;
        beforeBeta = camera.inertialBetaOffset;
    };
    const onAfter = (): void => {
        camera.inertialAlphaOffset += (camera.inertialAlphaOffset - beforeAlpha) * EXTRA;
        camera.inertialBetaOffset += (camera.inertialBetaOffset - beforeBeta) * EXTRA;
    };

    for (const type of MOVE_EVENTS) {
        canvas.addEventListener(type, onBefore, { capture: true });
    }

    const detachLibrary = attachControl(camera, canvas, scene);

    for (const type of MOVE_EVENTS) {
        canvas.addEventListener(type, onAfter);
    }

    return (): void => {
        detachLibrary();
        for (const type of MOVE_EVENTS) {
            canvas.removeEventListener(type, onBefore, { capture: true });
            canvas.removeEventListener(type, onAfter);
        }
    };
}
