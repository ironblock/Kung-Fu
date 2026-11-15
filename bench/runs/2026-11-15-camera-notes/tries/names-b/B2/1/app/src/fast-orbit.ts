import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drag speed multiplier relative to the library's default orbit controls.
const DRAG_SPEED_MULTIPLIER = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with drag turning the camera twice as fast as the defaults.
 *
 * The library's pointer handling divides pixel movement by
 * `camera.angularSensibility` (a larger value means slower turning), so the
 * drag speed is doubled by halving that value while the controls are attached.
 * Inertia (the glide after release) is built from the same drag input, so it
 * scales too. Wheel zoom does not use `angularSensibility` and is unchanged.
 *
 * Returns a function that removes the controls and restores the camera's
 * original `angularSensibility`.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_SPEED_MULTIPLIER;

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
