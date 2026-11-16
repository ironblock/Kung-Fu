import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drag speed multiplier relative to the library's default orbit controls.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard mouse/touch orbit controls to `camera`,
 * with drag rotation made twice as fast. Wheel zoom is unchanged.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angular sensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // angularSensibility is the library's drag-to-angle divisor (larger = slower),
    // so halving it doubles the rotation for the same pointer movement. The inertial
    // glide accumulates from the same input, so it is scaled too.
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_SPEED_FACTOR;

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        camera.angularSensibility = originalSensibility;
        throw err;
    }

    return () => {
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
