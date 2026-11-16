import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

/** How much faster the movement keys move the camera than the library's default. */
const FLY_SPEED_FACTOR = 20;

/**
 * Attaches the library's default free-camera fly controls (keyboard + mouse look)
 * to `canvas`, with every movement key moving the camera FLY_SPEED_FACTOR times as far.
 *
 * Movement is scaled through `camera.speed`, so the library's own key handling,
 * mouse look (angularSensitivity / inertia are untouched) and per-frame update are used
 * as-is. This module adds no listeners and no per-frame work of its own.
 *
 * Returns a function that detaches the library controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSpeed = camera.speed;
    camera.speed = defaultSpeed * FLY_SPEED_FACTOR;

    let detachControls: () => void;
    try {
        detachControls = attachFreeControl(camera, canvas, scene);
    } catch (error) {
        camera.speed = defaultSpeed;
        throw error;
    }

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        camera.speed = defaultSpeed;
    };
}
