import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drags turn the camera this many times as far as the library's default.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard mouse/touch orbit controls to `camera`,
 * with drag rotation (both axes, including the inertial glide) doubled.
 * Wheel zoom is untouched.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angular sensitivity.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // angularSensibility is a divisor: a larger value means slower rotation.
    // Halving it doubles the rotation per unit of pointer movement.
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_SPEED_FACTOR;

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    return () => {
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
