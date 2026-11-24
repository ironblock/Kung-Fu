import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls to `camera`, with drag turning
 * the camera twice as far per pixel of mouse/touch movement.
 *
 * The library's drag sensitivity is `camera.angularSensibility` (higher = slower
 * rotation), so halving it doubles the rotation for the same input, including the
 * inertial glide after release. Wheel zoom uses `wheelPrecision` and is untouched.
 *
 * Returns a cleanup function that detaches the controls (canvas listeners and the
 * per-frame inertia hook) and restores the camera's original sensitivity.
 * Safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    const fastSensibility = originalSensibility / 2;
    camera.angularSensibility = fastSensibility;

    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        // Only restore if nothing else changed the value in the meantime.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = originalSensibility;
        }
    };
}
