import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How many times farther than the library's default controls each movement key carries the camera. */
const MOVE_SCALE = 20;

/**
 * Attach the library's default free-camera fly controls (`attachFreeControl`) to `camera` on
 * `canvas`, with every movement key (W/A/S/D, arrows, Space/Shift/PageUp/PageDown) moving the
 * camera {@link MOVE_SCALE}× as far as the defaults do.
 *
 * The boost is applied through `camera.speed`, which the library documents as the movement
 * speed. Mouse look is driven by `camera.angularSensitivity` and `camera.inertia`, neither of
 * which is touched, so a given drag turns the camera by the same total amount as the defaults.
 * (Raising `inertia` would also lengthen movement coasting, but it would change mouse look too.)
 *
 * The returned function detaches the library controls (canvas listeners and their per-frame
 * hook) and puts `camera.speed` back to what it was. It is safe to call more than once.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const boostedSpeed = baseSpeed * MOVE_SCALE;

    // Set before attaching, so the boost holds whether the controls read `speed` every frame
    // or only once at attach time.
    camera.speed = boostedSpeed;

    let detachControls: () => void;
    try {
        detachControls = attachFreeControl(camera, canvas, scene);
    } catch (error) {
        camera.speed = baseSpeed;
        throw error;
    }

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        // Restore the speed only if nobody else changed it while we were attached.
        if (camera.speed === boostedSpeed) camera.speed = baseSpeed;
    };
}
