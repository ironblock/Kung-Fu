import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How many times further a drag turns the camera than the library's default controls. */
const ORBIT_SPEED_FACTOR = 2;

/**
 * Attach the library's standard arc-rotate mouse/touch controls, with drag
 * rotation (and the glide after release) twice as fast as the default.
 *
 * The standard controls turn the camera by `pixels moved / angularSensibility`
 * on both axes and feed that into the inertial alpha/beta offsets, which the
 * glide then decays. Halving `angularSensibility` therefore doubles the turn
 * and the glide together. Wheel zoom is driven by `wheelPrecision` and panning
 * by `panningSensibility`, so both are left exactly as the library does them.
 *
 * Returns a cleanup function that detaches the controls (canvas listeners and
 * the per-frame inertia hook) and restores the camera's original sensitivity.
 * Safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    const fastSensibility = originalSensibility / ORBIT_SPEED_FACTOR;

    // Set before attaching, so it applies whether the controls read the value once or on every event.
    camera.angularSensibility = fastSensibility;
    const detachControl = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControl();
        // Leave the camera as we found it, unless the app has set its own value since.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = originalSensibility;
        }
    };
}
