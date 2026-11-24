import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with drag turning the camera twice as far as the default.
 *
 * Drag, touch and the glide after release all go through the camera's
 * angularSensibility, so halving it doubles the turn for the same movement.
 * Wheel zoom is untouched. No per-frame work of our own is added.
 *
 * Returns a function that removes the controls and restores the original
 * angularSensibility (only if nothing else has changed it since).
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;
    const fastSensibility = defaultSensibility / 2;

    camera.angularSensibility = fastSensibility;
    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = defaultSensibility;
        }
    };
}
