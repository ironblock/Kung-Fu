import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit/pan/wheel/touch controls to an
 * ArcRotateCamera, with mouse and touch drags turning the camera twice as far.
 *
 * `camera.angularSensibility` is a divisor (higher = slower rotation), so
 * halving it doubles the rotation per unit of pointer movement. Inertia (the
 * glide after release) is driven by the same input, so it doubles too. Pan
 * and wheel zoom use their own settings and are left untouched.
 *
 * The returned function detaches the controls (canvas listeners and the
 * per-frame inertia hook) and restores the camera's original sensitivity.
 * Safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
