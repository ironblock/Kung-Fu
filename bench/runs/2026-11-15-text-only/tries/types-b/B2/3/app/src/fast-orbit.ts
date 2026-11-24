import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Drag speed multiplier relative to the library's default orbit controls.
 * `angularSensibility` is a divisor (higher = slower), so halving it doubles
 * how far a drag turns the camera for the same pointer movement.
 */
const DRAG_SPEED_FACTOR = 2;

/**
 * Attach the library's standard arc-rotate mouse and touch controls to the
 * camera, with orbit drag turning the camera twice as far as the default.
 *
 * Wheel zoom, pinch zoom and panning keep the library defaults. The inertia
 * glide scales with the drag because it accumulates the same input.
 *
 * @returns A cleanup function that removes the canvas listeners and the
 * per-frame inertia hook, and restores the camera's original
 * `angularSensibility`. Safe to call more than once.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultSensibility = camera.angularSensibility;
    const fastSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    // Set before attaching so the controls see the faster value whether they
    // read it per event or cache it on attach.
    camera.angularSensibility = fastSensibility;

    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        // Only restore if nothing else changed the value while we were attached.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = defaultSensibility;
        }
    };
}
