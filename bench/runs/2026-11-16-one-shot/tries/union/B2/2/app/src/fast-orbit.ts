import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library turns the camera by dx / angularSensibility per pointer move
// (alpha) and dy / angularSensibility (beta). Halving the sensibility doubles
// the turn for the same mouse or touch movement. The glide after release is
// built from the same offsets, so it doubles too. Wheel zoom uses
// wheelPrecision and keyboard turns use their own options, so neither changes.
const DRAG_TURN_FACTOR = 2;

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    const fastSensibility = originalSensibility / DRAG_TURN_FACTOR;

    camera.angularSensibility = fastSensibility;

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;

        detachControls();

        // Restore the original value only if nothing else has changed it since.
        if (camera.angularSensibility === fastSensibility) {
            camera.angularSensibility = originalSensibility;
        }
    };
}
