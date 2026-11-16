import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much faster movement keys move the camera than the library default. */
const MOVE_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera keyboard and mouse controls, with
 * movement keys (WASD, arrows, rise/sink) scaled by MOVE_SPEED_MULTIPLIER.
 *
 * Only `camera.speed` is changed, so mouse look (angular sensitivity, inertia
 * and so on) behaves exactly as the default. No per-frame callback is
 * registered by this module.
 *
 * Returns a function that detaches the controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * MOVE_SPEED_MULTIPLIER;

    let detachControls: () => void;
    try {
        detachControls = attachFreeControl(camera, canvas, scene);
    } catch (err) {
        camera.speed = baseSpeed;
        throw err;
    }

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        camera.speed = baseSpeed;
    };
}
