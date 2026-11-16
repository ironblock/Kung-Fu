import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

/** How much farther the movement keys carry the camera than the library's default. */
const KEY_MOVE_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse controls to `canvas`,
 * with every movement key (W/A/S/D, arrows, rise/sink keys) moving the camera
 * KEY_MOVE_MULTIPLIER times as far as the default controls do.
 *
 * Keyboard movement scales with `camera.speed`, so the speed is multiplied for
 * as long as the controls are attached. Mouse look is driven by
 * `angularSensitivity`, which is not touched, so it behaves exactly as the default.
 *
 * Returns a function that detaches the controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const boostedSpeed = baseSpeed * KEY_MOVE_MULTIPLIER;
    camera.speed = boostedSpeed;

    let detach: () => void;
    try {
        detach = attachFreeControl(camera, canvas, scene);
    } catch (error) {
        camera.speed = baseSpeed;
        throw error;
    }

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detach();
        // Only restore if nobody changed the speed while the controls were attached.
        if (camera.speed === boostedSpeed) {
            camera.speed = baseSpeed;
        }
    };
}
