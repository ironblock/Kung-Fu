import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls to `camera` on `canvas`,
 * but with drags turning the camera twice as far as the defaults.
 *
 * Drag turn is inversely proportional to `camera.angularSensibility`, so
 * halving that value doubles the turn. The inertia glide after release is
 * built from the same offsets, so it is doubled too. Wheel zoom is driven
 * by `wheelPrecision`, not by this value, so it is unchanged.
 *
 * Returns a function that removes the controls and restores the camera's
 * original `angularSensibility`.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;

    // Set before attaching so the controls see the new value from the first event.
    camera.angularSensibility = originalSensibility / 2;

    // The scene must be passed: without it, drags only accumulate inertial
    // offsets that nothing applies.
    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
