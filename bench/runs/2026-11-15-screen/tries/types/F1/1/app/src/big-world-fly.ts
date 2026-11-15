import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much farther every movement key moves the camera than the library default. */
const MOVEMENT_SPEED_MULTIPLIER = 20;

/**
 * Attach the library's default keyboard + mouse fly controls to a FreeCamera,
 * with keyboard movement (WASD, arrows, and the rise/sink keys) scaled up by 20x.
 *
 * Movement is driven by `camera.speed`, so it is scaled by writing a larger
 * speed while attached. Mouse look is governed by `angularSensitivity` and is
 * left untouched, so drags turn the camera exactly as the default controls do.
 *
 * @returns A cleanup function that removes the controls and restores the
 *   camera's original speed. Safe to call more than once.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const detachFreeControl = attachFreeControl(camera, canvas, scene);
    camera.speed = baseSpeed * MOVEMENT_SPEED_MULTIPLIER;

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachFreeControl();
        camera.speed = baseSpeed;
    };
}
