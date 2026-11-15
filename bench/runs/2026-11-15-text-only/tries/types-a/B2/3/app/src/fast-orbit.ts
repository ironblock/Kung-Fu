import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls to an ArcRotateCamera, with
 * drag rotation (mouse, pen and touch, including inertial glide) at twice the
 * default speed. Wheel zoom and pan are unchanged.
 *
 * The library scales drag rotation by `camera.angularSensibility`, where a
 * higher value means slower rotation. Halving it doubles the rotation speed.
 * The value is halved relative to whatever the camera has at attach time, and
 * restored on detach.
 *
 * @returns A cleanup function that removes the canvas listeners and the
 * library's inertia hook, and restores the camera's original sensitivity.
 * Safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    if (!(originalSensibility > 0) || !Number.isFinite(originalSensibility)) {
        throw new Error(
            `attachFastOrbit: camera.angularSensibility must be a positive finite number, got ${originalSensibility}`,
        );
    }

    // Set before attaching so the value is in effect for every input event and
    // for the inertia that accumulates from them.
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
