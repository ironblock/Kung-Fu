import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const BIG_WORLD_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera fly controls to `canvas`, with
 * movement sped up 20x. Movement keys are scaled through `camera.speed`, so
 * mouse look (which is driven by `angularSensitivity`) is left untouched.
 * No per-frame work is done here; the library's own control loop does the work.
 *
 * Returns a function that detaches the controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * BIG_WORLD_SPEED_MULTIPLIER;

    const detach = attachFreeControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detach();
        camera.speed = baseSpeed;
    };
}
