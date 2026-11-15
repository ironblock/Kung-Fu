import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much farther every movement key moves the camera than the library default. */
const MOVE_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default fly controls to `camera`, with keyboard
 * movement (WASD, arrows, rise/sink keys) scaled by MOVE_SPEED_MULTIPLIER.
 * Mouse look is untouched, so drag-to-turn behaves exactly as the default.
 *
 * Returns a function that removes the controls and restores the camera's
 * original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSpeed = camera.speed;

    // Set the scaled speed before attaching so it applies whether the
    // controls read camera.speed live or capture it at attach time.
    camera.speed = defaultSpeed * MOVE_SPEED_MULTIPLIER;
    const detachControls = attachFreeControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        camera.speed = defaultSpeed;
    };
}
