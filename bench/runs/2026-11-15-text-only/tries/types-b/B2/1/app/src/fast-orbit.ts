import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls to `camera`, with mouse and
 * touch drags turning the camera twice as far as the defaults.
 *
 * The library divides drag movement by `camera.angularSensibility` (higher
 * value = slower rotation), so halving that value doubles rotation for both
 * axes and for the inertia glide after release. Wheel zoom uses a separate
 * setting (`wheelPrecision`) and is left untouched.
 *
 * The returned function detaches the controls (canvas listeners and the
 * per-frame inertia hook) and restores the camera's original sensitivity.
 * It is safe to call more than once.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
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
