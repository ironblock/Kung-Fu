import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drags turn the camera this many times as far as the library default.
const ORBIT_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, with orbit (rotation) speed doubled. Wheel zoom is untouched.
 *
 * Assumes `angularSensibility` is a divisor (Babylon.js convention: a larger
 * value means slower turning), so the speed is doubled by halving it. The
 * original value is restored when the returned function is called.
 *
 * Returns a function that removes the controls and restores the sensitivity.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / ORBIT_SPEED_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
