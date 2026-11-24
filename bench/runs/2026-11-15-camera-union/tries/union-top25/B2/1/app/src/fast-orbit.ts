import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with drags turning the camera twice as far as the defaults.
 *
 * The drag rotation is scaled by camera.angularSensibility (default 1000), so
 * halving it while the controls are attached doubles the turn for the same
 * pointer movement. The glide after release is driven by the same inertial
 * offset, so it is doubled too. Wheel zoom depends on wheelPrecision and the
 * radius, not on angularSensibility, so it is unchanged.
 *
 * Returns a function that detaches the controls and restores the camera's
 * original angularSensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
