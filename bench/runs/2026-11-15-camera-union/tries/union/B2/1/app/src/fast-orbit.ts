import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with drags turning the camera twice as far.
 *
 * The library turns the camera by dx / angularSensibility (and dy likewise), so
 * halving angularSensibility doubles the turn for the same pointer movement.
 * The glide after release is built from the same offsets, so it doubles too.
 * The wheel and the two-finger pinch do not use angularSensibility, so zoom is
 * unchanged.
 *
 * The returned function removes the controls and restores the camera's original
 * angularSensibility. The library's own dispose function handles the canvas
 * listeners and the per-frame hook, so nothing of ours runs each frame.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
