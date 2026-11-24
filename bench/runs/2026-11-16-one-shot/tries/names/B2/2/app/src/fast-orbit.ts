import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Assumes the library follows the Babylon.js convention where a larger
// angularSensibility means slower rotation. Halving it doubles the rotation
// for the same mouse movement, including the inertial glide.
const DRAG_SPEED_FACTOR = 2;

export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_SPEED_FACTOR;

    let detach: () => void;
    try {
        detach = attachControl(camera, canvas, scene);
    } catch (error) {
        camera.angularSensibility = originalSensibility;
        throw error;
    }

    return () => {
        detach();
        camera.angularSensibility = originalSensibility;
    };
}
