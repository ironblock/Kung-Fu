import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, but with orbit drags turning the camera twice as far.
 *
 * The drag's rotation is scaled by camera.angularSensibility, so halving that
 * value doubles every drag turn, including the inertial glide after release.
 * Wheel zoom, pinch and keyboard do not read it, so they are unchanged.
 *
 * Returns a function that removes the controls and restores the original
 * angularSensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultSensibility / 2;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = defaultSensibility;
    };
}
