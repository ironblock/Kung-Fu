import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Drags turn the camera this many times as far as the library default.
const DRAG_TURN_FACTOR = 2;

export function attachFastOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Assumes angularSensibility is a divisor (higher = slower turning), as in
    // Babylon.js. Halving it doubles the turn per pixel of mouse or touch movement.
    const originalSensibility = camera.angularSensibility;
    camera.angularSensibility = originalSensibility / DRAG_TURN_FACTOR;

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        camera.angularSensibility = originalSensibility;
    };
}
