import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, but makes drags turn the camera twice as far as the defaults do.
 *
 * Drag rotation (including the inertial glide after release) is scaled by
 * camera.angularSensibility, so halving that value doubles the turn for both
 * left-right and up-down. Wheel zoom and pinch are not affected by it.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angularSensibility.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
