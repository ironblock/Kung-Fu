import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`,
 * with orbit drags turning the camera twice as far as the default.
 *
 * The library divides mouse-drag orbit deltas by `camera.angularSensibility`
 * (higher = slower), so halving that value doubles the rotation for the same
 * movement. Inertia (the glide after release) is accumulated from the same
 * input path, so it scales with the change. Zoom (wheel and pinch) and pan are
 * untouched.
 *
 * The returned function detaches the controls and restores the original
 * sensitivity. It is safe to call more than once.
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
