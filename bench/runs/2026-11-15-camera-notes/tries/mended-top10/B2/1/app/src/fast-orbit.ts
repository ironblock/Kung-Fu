import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drags turn the camera this many times as far as the library's default.
const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard mouse and touch controls to an orbit camera,
 * with orbit drags (mouse and touch, including the glide after release) turning
 * the camera DRAG_SPEED_FACTOR times as far.
 *
 * The speed-up is done by dividing angularSensibility, which the library uses to
 * scale drag input into the orbit offsets. The wheel zoom uses wheelPrecision and
 * is not affected.
 *
 * Returns a function that removes the controls and restores angularSensibility.
 */
export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultSensibility = camera.angularSensibility;
    camera.angularSensibility = defaultSensibility / DRAG_SPEED_FACTOR;

    const detach = attachControl(camera, canvas, scene);

    return () => {
        detach();
        camera.angularSensibility = defaultSensibility;
    };
}
