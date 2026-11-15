import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * How many times farther a drag turns the camera than the library default.
 * `angularSensibility` is a divisor (higher = slower), so dividing it by 2
 * doubles the rotation for the same mouse movement, including the inertia
 * glide, which is built from the same scaled input.
 */
const DRAG_SPEED_MULTIPLIER = 2;

/**
 * Attach the library's standard arc-rotate mouse/touch controls to `camera`,
 * with orbit drags turning the camera twice as far as the default.
 *
 * Wheel zoom, panning, and all other behavior are left at library defaults.
 * The returned function detaches the canvas listeners and the inertia hook
 * installed by `attachControl`, then restores the camera's original
 * `angularSensibility`. It is safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_SPEED_MULTIPLIER;

    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
