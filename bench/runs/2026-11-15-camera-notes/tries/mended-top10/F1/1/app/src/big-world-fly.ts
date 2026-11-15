import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much farther every movement key moves the camera than the library default. */
const FLY_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's keyboard and mouse fly controls to a free camera, with
 * movement (WASD, arrows, rise/sink keys) scaled by FLY_SPEED_MULTIPLIER.
 *
 * Only `camera.speed` is changed. Mouse look is driven by `angularSensitivity`,
 * which is left alone, so drags turn the camera exactly as the default controls do.
 *
 * Returns a function that removes the controls and restores the camera's speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSpeed = camera.speed;
    const flySpeed = defaultSpeed * FLY_SPEED_MULTIPLIER;

    camera.speed = flySpeed;
    const detachControls = attachFreeControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        // Only restore if nothing else has changed the speed since we set it.
        if (camera.speed === flySpeed) {
            camera.speed = defaultSpeed;
        }
    };
}
