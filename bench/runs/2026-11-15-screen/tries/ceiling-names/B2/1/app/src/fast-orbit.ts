import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How many times farther a drag turns the camera than the library's default controls. */
const ROTATION_MULTIPLIER = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to `canvas`,
 * except that dragging turns the camera ROTATION_MULTIPLIER times as far.
 *
 * How it works: we divide `camera.angularSensibility` before attaching. As in Babylon.js,
 * this value is a divisor: a drag of N pixels adds N / angularSensibility radians to the
 * camera's inertial alpha/beta offsets, and the glide after release comes from those same
 * offsets. So halving it doubles both axes and the glide. Wheel zoom uses `wheelPrecision`
 * and panning uses `panningSensibility`, and we leave both alone.
 *
 * The returned function detaches the library's controls (its canvas listeners and its
 * per-frame update) and puts the camera's original angularSensibility back. We add no
 * listeners or per-frame callbacks of our own. Calling it more than once does nothing extra.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    const fastSensibility = originalSensibility / ROTATION_MULTIPLIER;

    // Set this before attaching, so it applies whether the controls read the value
    // once when attached or on every pointer move.
    camera.angularSensibility = fastSensibility;

    let detach: (() => void) | null;
    try {
        detach = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    return () => {
        if (!detach) {
            return;
        }
        const detachDefaultControls = detach;
        detach = null;
        detachDefaultControls();

        // Only restore the old value if nobody else changed it while we were attached.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = originalSensibility;
        }
    };
}
