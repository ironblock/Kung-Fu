import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

// Drag turns the camera this many times as far as the library default.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `canvas`,
 * with orbit drag (alpha and beta, including inertial glide) running at
 * DRAG_SPEED_FACTOR times the default speed. Wheel zoom is untouched.
 *
 * Assumes the library's drag rotation is inversely proportional to
 * `camera.angularSensibility` (higher value = slower), as in Babylon.js.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angularSensibility. Registers nothing per frame.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    let detachControls: (() => void) | undefined;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        camera.angularSensibility = defaultSensibility;
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls?.();
        camera.angularSensibility = defaultSensibility;
    };
}
