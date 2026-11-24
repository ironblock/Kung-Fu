import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls to `camera`, but with drags
 * turning the camera twice as far for the same mouse movement.
 *
 * `angularSensibility` is a divisor (higher = slower rotation), so halving it
 * doubles the rotation. Wheel zoom (`wheelPrecision`) is left untouched.
 *
 * Returns a cleanup function that detaches the controls and restores the
 * camera's original `angularSensibility`. Safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;

    // Set before attaching so the controls see the faster value from the start.
    camera.angularSensibility = originalSensibility / 2;

    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
