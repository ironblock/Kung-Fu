import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** How much farther a drag turns the camera than the library default. */
const DRAG_SPEED_MULTIPLIER = 2;

/**
 * Attach the library's standard arc-rotate controls with faster orbit drag.
 *
 * `angularSensibility` is a divisor (higher = slower), so dividing it by
 * `DRAG_SPEED_MULTIPLIER` makes every drag turn the camera that many times as
 * far. The post-release glide is built from the same input, so it scales too.
 * Wheel zoom and the pinch gesture are left to the library unchanged.
 *
 * Returns a cleanup function that detaches the controls and restores the
 * camera's original `angularSensibility` (unless it was changed by someone
 * else in the meantime). Safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultSensibility = camera.angularSensibility;
    const fastSensibility = defaultSensibility / DRAG_SPEED_MULTIPLIER;

    // Set before attaching so the controls see the new value.
    camera.angularSensibility = fastSensibility;
    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detachControls();
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = defaultSensibility;
        }
    };
}
