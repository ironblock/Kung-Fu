import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (mouse and touch) to `canvas`,
 * but with drag turning the camera twice as far as the defaults.
 *
 * The drag adds dx / angularSensibility to the inertial alpha/beta offsets, so
 * halving angularSensibility for the lifetime of the controls doubles the turn.
 * The glide after release is the same inertial offset, so it doubles too.
 * Wheel zoom (wheelPrecision) and pinch (radius) are not affected.
 *
 * Returns a function that removes the controls and restores angularSensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Set before attaching, in case the controls read the value when attached.
    camera.angularSensibility /= 2;

    let detach: () => void;
    try {
        detach = attachControl(camera, canvas, scene);
    } catch (err) {
        camera.angularSensibility *= 2;
        throw err;
    }

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detach();
        // Multiply rather than restore the old value, so any change the caller made meanwhile is kept.
        camera.angularSensibility *= 2;
    };
}
