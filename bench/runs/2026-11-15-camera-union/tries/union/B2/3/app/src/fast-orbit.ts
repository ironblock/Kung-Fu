import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const DRAG_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard orbit controls to `camera` on `canvas`, but with
 * drags turning the camera twice as far. The library adds dx / angularSensibility
 * to the alpha/beta offsets on each drag move, and those offsets also drive the
 * glide after release, so halving angularSensibility doubles both. Wheel zoom,
 * pinch, panning and keyboard are not affected by this field.
 *
 * Returns a function that removes the controls and restores angularSensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Set before attachControl so it is in effect whether the library reads the
    // value when attaching or on each pointer move.
    camera.angularSensibility /= DRAG_SPEED_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        // Multiply rather than restore a saved value, so any change the caller
        // made to angularSensibility while attached is kept. Halving and doubling
        // are exact in binary floating point.
        camera.angularSensibility *= DRAG_SPEED_FACTOR;
    };
}
