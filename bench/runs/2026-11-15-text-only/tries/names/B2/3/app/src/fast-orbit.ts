import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

// Drag speed factor. A drag turns the camera this many times as far as the
// library's default controls do for the same mouse or touch movement.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, with orbit drag turning the camera twice as far as the default.
 *
 * Wheel zoom is left to the library's defaults. The returned function removes
 * the controls and restores the camera's original angular sensitivity.
 *
 * Assumes the library's `angularSensibility` is a divisor applied to pointer
 * movement (higher value = slower turn), as in Babylon.js. Dividing it by
 * DRAG_SPEED_FACTOR therefore doubles the turn. The sign of this convention
 * could not be verified against the library source, which is not on this machine.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;

    // Set before attaching so the controls see the scaled value however they
    // read it. The glide after release uses the same offsets, so it is scaled too.
    camera.angularSensibility = originalSensibility / DRAG_SPEED_FACTOR;

    const detach = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
