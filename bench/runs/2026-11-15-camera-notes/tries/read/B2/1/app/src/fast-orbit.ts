import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, but makes orbit drags turn the camera twice as far.
 *
 * The library turns the camera by `pixelDelta / angularSensibility` for both
 * alpha and beta, and the release glide is built from those same offsets, so
 * halving `angularSensibility` for the lifetime of the controls doubles the drag
 * and the glide. Wheel zoom and pinch do not read `angularSensibility`, so they
 * are unchanged.
 *
 * The returned function removes the canvas listeners and restores the original
 * `angularSensibility`. It adds nothing that runs per frame.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detachControls = attachControl(camera, canvas, scene);
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
