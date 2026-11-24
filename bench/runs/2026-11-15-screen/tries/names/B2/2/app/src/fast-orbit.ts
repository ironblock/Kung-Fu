import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `camera`,
 * but with drags turning the camera twice as far as the defaults.
 *
 * Drag speed is controlled by `camera.angularSensibility`, which both the
 * drag itself and the post-release glide (inertia) are derived from. Halving
 * it doubles the rotation per pixel of pointer movement. Wheel zoom is not
 * touched.
 *
 * Returns a function that removes the controls and restores the camera's
 * original angularSensibility.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    const originalSensibility = camera.angularSensibility;
    const detachControls = attachControl(camera, canvas, scene);

    camera.angularSensibility = originalSensibility / 2;

    return () => {
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
