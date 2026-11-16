import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera by (pixels / angularSensibility) before the glide.
// Halving the sensibility doubles the turn for the same mouse or touch movement,
// and the glide is built from the same offsets, so it doubles too.
const DRAG_TURN_FACTOR = 2;

/**
 * Attaches the library's standard orbit controls to `canvas`, with drag rotation
 * made twice as fast. Wheel zoom and pinch are unchanged.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angularSensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_TURN_FACTOR;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
