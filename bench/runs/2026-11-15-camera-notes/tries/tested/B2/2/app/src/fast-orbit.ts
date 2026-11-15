import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * How many times farther a drag turns the camera than the library default.
 * The library divides pointer movement by `angularSensibility`, so halving that
 * value doubles the turn for the same mouse or touch movement. The glide after
 * release is built from the same inertial offsets, so it scales too.
 */
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, with drag rotation twice as fast. Wheel zoom is unchanged.
 *
 * Returns a function that removes the controls and restores the camera's
 * original `angularSensibility`.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultAngularSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultAngularSensibility / DRAG_SPEED_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        camera.angularSensibility = defaultAngularSensibility;
    };
}
