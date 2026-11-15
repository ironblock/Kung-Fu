import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard mouse and touch orbit controls to an arc-rotate
 * camera, with drags turning the camera twice as far as the defaults.
 *
 * The library's drag handler computes `inertialAlphaOffset -= dx / angularSensibility`
 * (and the same for beta) and reads `angularSensibility` live on every event. The
 * glide after release is built from those same offsets, so halving the divisor
 * doubles the drag and the glide together. Wheel zoom uses `wheelPrecision` and is
 * not touched. Keyboard input (not attached here) uses its own sensitivity.
 *
 * The returned function detaches the controls (DOM listeners and the per-frame
 * inertia hook) and restores `angularSensibility`. If the caller changed
 * `angularSensibility` while attached, that value is left in place. Safe to call
 * more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;
    const fastSensibility = defaultSensibility / 2;
    camera.angularSensibility = fastSensibility;

    const detachControls = attachControl(camera, canvas, scene);
    let detached = false;

    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = defaultSensibility;
        }
    };
}
