import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with drag rotation twice as fast as the default.
 *
 * The library turns the camera by dividing pointer movement by
 * `angularSensibility`, so halving that value doubles the turn for the same
 * movement. Touch drag and the post-release glide use the same field, so they
 * scale too. Wheel zoom and pinch are not affected.
 *
 * Returns a cleanup that detaches the controls and restores the camera's
 * original `angularSensibility`. It is safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

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
