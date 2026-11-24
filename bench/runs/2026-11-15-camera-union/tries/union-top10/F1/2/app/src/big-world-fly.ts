import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much farther each held movement key carries the camera than the library default. */
const KEY_MOVE_MULTIPLIER = 20;

/**
 * Attaches the library's standard fly controls (keyboard and mouse) to a free camera,
 * with keyboard movement scaled up for large worlds.
 *
 * Movement keys are scaled by raising `camera.speed` for the lifetime of the controls.
 * Mouse look is driven by `angularSensitivity`, which is left untouched, so drags turn
 * the camera by the same amount as the default controls.
 *
 * Returns a function that detaches the controls and restores the original speed.
 * Nothing is registered per frame.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSpeed = camera.speed;
    const boostedSpeed = defaultSpeed * KEY_MOVE_MULTIPLIER;

    camera.speed = boostedSpeed;
    let detachFreeControl: () => void;
    try {
        detachFreeControl = attachFreeControl(camera, canvas, scene);
    } catch (err) {
        camera.speed = defaultSpeed;
        throw err;
    }

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detachFreeControl();
        // Only restore if nothing else changed the speed while we were attached.
        if (camera.speed === boostedSpeed) {
            camera.speed = defaultSpeed;
        }
    };
}
