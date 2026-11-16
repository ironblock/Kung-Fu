import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard mouse and touch controls to an arc-rotate
 * camera, but with drags turning the camera twice as far as the defaults.
 *
 * The library turns the camera by dividing pixel movement by
 * `angularSensibility`, so halving that value doubles the turn for both axes.
 * The value is read when the controls are attached and restored on detach.
 * Wheel zoom is untouched, since it uses `wheelPrecision`.
 *
 * Returns a function that removes the controls and restores the camera's
 * original `angularSensibility`.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
