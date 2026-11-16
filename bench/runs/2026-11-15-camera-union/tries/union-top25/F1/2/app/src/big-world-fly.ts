import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const BIG_WORLD_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera fly controls to `canvas`, with
 * keyboard movement scaled up by 20x. Mouse look is untouched.
 *
 * The movement speed is raised through `camera.speed` before the library's
 * controls are attached, and restored when the returned function is called.
 * Nothing else is added: no per-frame work and no extra listeners.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * BIG_WORLD_SPEED_MULTIPLIER;

    const detachControls = attachFreeControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        camera.speed = baseSpeed;
    };
}
