import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drags turn the camera this many times as far as the library default.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard arc-rotate mouse and touch controls, with
 * drag rotation (including the post-release glide) sped up by DRAG_SPEED_FACTOR.
 *
 * The speed-up is done by lowering `angularSensibility`, which the library
 * uses for drag rotation only. Wheel zoom uses `wheelPrecision` and pinch
 * uses its own path, so both keep the library's default behaviour.
 *
 * Returns a function that detaches the controls and restores the camera's
 * original `angularSensibility`. This module adds no per-frame work of its own.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSensibility = camera.angularSensibility;

    // Set before attaching so the controls see the new value from their first event.
    camera.angularSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        camera.angularSensibility = defaultSensibility;
    };
}
