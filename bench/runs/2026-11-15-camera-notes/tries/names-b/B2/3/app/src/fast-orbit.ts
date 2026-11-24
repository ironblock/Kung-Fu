import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// How much further a drag turns the camera than the library default.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to the canvas,
 * with orbit drag (rotation) running at DRAG_SPEED_FACTOR times the default speed.
 * Wheel zoom and the post-release glide are left to the library; the glide scales
 * with the drag because it is built from the same pointer deltas.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angular sensitivity. Nothing is run per frame.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;

    // ASSUMPTION (not verified against the library source): angularSensibility is a
    // divisor applied to pointer deltas (higher value = slower), as in Babylon.js.
    // Halving it doubles the rotation per unit of mouse movement. If the library
    // instead treats it as a multiplier, this must become `* DRAG_SPEED_FACTOR`.
    camera.angularSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    const detach = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detach();
        camera.angularSensibility = defaultSensibility;
    };
}
