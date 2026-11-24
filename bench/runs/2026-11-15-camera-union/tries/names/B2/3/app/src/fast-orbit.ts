import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls, but with
 * drags turning the camera twice as far.
 *
 * The library's pointer input divides pointer movement by `angularSensibility`
 * (larger = slower), so halving that value doubles the rotation for both mouse
 * and touch drags, including the inertial glide after release. The wheel zoom
 * uses `wheelPrecision` and is left untouched.
 *
 * The returned function detaches the controls and restores the original
 * `angularSensibility`.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    let detach: () => void;
    try {
        detach = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
