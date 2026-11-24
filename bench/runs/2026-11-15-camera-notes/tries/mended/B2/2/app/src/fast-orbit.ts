import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drag turns the camera this many times as far as the library's default.
const DRAG_TURN_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with orbit drags turning the camera DRAG_TURN_FACTOR times as far.
 *
 * The library's drag adds an amount inversely proportional to
 * `camera.angularSensibility` to the inertial alpha/beta offsets, and the glide
 * is decayed from those same offsets. Halving the sensibility therefore scales
 * both the direct drag and the glide. Wheel zoom and pinch do not use it, so
 * they behave as the library's defaults.
 *
 * Returns a function that detaches the controls and restores the camera's
 * previous `angularSensibility`.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    const fastSensibility = originalSensibility / DRAG_TURN_FACTOR;

    camera.angularSensibility = fastSensibility;

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        // Only restore if nothing else has changed the value since we set it.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = originalSensibility;
        }
    };
}
