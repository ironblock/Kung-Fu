import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `camera`,
 * but with orbit drag turning the camera twice as far per unit of pointer movement.
 *
 * The library scales pointer movement by `camera.angularSensibility` (a divisor:
 * a smaller value means a faster turn). Halving that value doubles the drag
 * rotation, and the inertial glide after release, which is built from the same
 * pointer deltas. Wheel zoom uses `wheelPrecision` and is not touched.
 *
 * The returned function detaches the controls and restores the original sensitivity.
 * No per-frame work is registered.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        camera.angularSensibility = originalSensibility;
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
