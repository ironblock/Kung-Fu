import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard mouse and touch controls to an arc-rotate
 * camera, with drag turning the camera twice as far as the defaults.
 *
 * The turn per pixel of drag is set by `camera.angularSensibility`, which
 * the controls read when a drag moves. Halving it before attaching doubles
 * the turn for both axes. The glide after release is built from the same
 * inertial offsets, so it doubles too. Wheel zoom and pinch do not use this
 * field and are left unchanged.
 *
 * The returned function detaches the controls and restores the original
 * angularSensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
