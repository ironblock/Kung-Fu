import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * canvas, but with orbit drags turning the camera twice as far.
 *
 * The library scales drag input by dividing it by `camera.angularSensibility`
 * (a larger value means slower turning). Halving that value doubles the turn
 * for left-right and up-down drags, and the inertial glide after release is
 * built from the same drag input, so it is doubled too. Wheel zoom and pinch
 * use other fields and are left as the library has them.
 *
 * The returned function detaches the controls and restores the original
 * sensitivity. It adds no per-frame work of its own.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;

    const detach = attachControl(camera, canvas, scene);
    camera.angularSensibility = originalSensibility / 2;

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
