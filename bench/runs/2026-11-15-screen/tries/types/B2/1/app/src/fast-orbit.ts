import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard arc-rotate mouse and touch controls to `camera`,
 * with drag rotation running at twice the default speed.
 *
 * `angularSensibility` is the divisor applied to drag movement (higher = slower),
 * so halving it doubles the rotation for the same pointer movement. The inertial
 * glide is built from the same accumulated input, so it is doubled too. Wheel zoom
 * and pan use other settings and are left untouched.
 *
 * The returned function detaches the controls and restores the camera's original
 * `angularSensibility`. It is safe to call more than once. This module adds no
 * per-frame work of its own; the inertia hook belongs to `attachControl` and is
 * removed by the returned cleanup.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / 2;

    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
