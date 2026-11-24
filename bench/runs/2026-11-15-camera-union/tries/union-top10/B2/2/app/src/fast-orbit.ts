import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drags turn the camera by (pixel delta / angularSensibility), so halving the
// sensibility doubles the turn for the same mouse or touch movement. The
// glide after release is driven by the same inertial offsets, so it doubles too.
// Wheel zoom uses wheelPrecision and is not affected.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls to the
 * camera, with drags turning it DRAG_SPEED_FACTOR times as far as the default.
 * Returns a function that removes the controls and restores the camera's
 * original angularSensibility.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    let detachControls: (() => void) | undefined;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        camera.angularSensibility = defaultSensibility;
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls?.();
        camera.angularSensibility = defaultSensibility;
    };
}
