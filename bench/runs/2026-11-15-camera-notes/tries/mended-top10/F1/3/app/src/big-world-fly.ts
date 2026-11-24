import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** Keyboard movement is multiplied by this factor; mouse look is not touched. */
const MOVE_SPEED_FACTOR = 20;

/**
 * Attaches the library's default free-camera fly controls, with keyboard
 * movement (W/A/S/D, arrows, rise/sink keys) scaled by MOVE_SPEED_FACTOR.
 * Mouse look uses angularSensitivity, which is left unchanged.
 *
 * Returns a function that detaches the controls and restores the camera's
 * original speed. Nothing is run per frame by this module.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const scaledSpeed = baseSpeed * MOVE_SPEED_FACTOR;

    // Set before attaching so the controls see the scaled value.
    camera.speed = scaledSpeed;
    const detach = attachFreeControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detach();
        // Restore only if nothing else has changed speed since we set it.
        if (camera.speed === scaledSpeed) {
            camera.speed = baseSpeed;
        }
    };
}
