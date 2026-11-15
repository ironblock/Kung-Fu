import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to the camera,
 * with orbit drags turning the camera twice as far for the same pointer movement.
 *
 * The library converts pointer movement into rotation by dividing by
 * `camera.angularSensibility`, so halving that value doubles the rotation.
 * Glide (inertia) is driven by the same rotation offsets, so it is scaled too.
 * Wheel zoom is untouched.
 *
 * Returns a function that removes the controls and restores the original sensibility.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
