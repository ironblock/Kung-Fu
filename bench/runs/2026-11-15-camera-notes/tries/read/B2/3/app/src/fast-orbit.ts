import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// A drag turns the camera by dx / angularSensibility per pointer move, and the
// glide after release is built from that same offset, so halving the
// sensibility doubles both the drag and the glide. Wheel zoom and pinch are
// separate code paths and are left untouched.
const TURN_SPEED_FACTOR = 2;

/**
 * Attaches the library's standard mouse and touch controls to an arc-rotate
 * camera, with rotation twice as fast as the default. Returns a function that
 * removes the controls and restores the camera's original sensibility.
 */
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / TURN_SPEED_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
