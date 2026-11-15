import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How many times farther than the library's default each movement key moves the camera. */
const MOVE_MULTIPLIER = 20;

/**
 * Attaches the library's own keyboard + mouse fly controls (attachFreeControl)
 * to `camera` on `canvas`, with every movement key moving 20x as far.
 *
 * How: in Babylon Lite 1.39.0 a held move key adds
 *   speed * max(deltaMs, 1) / sqrt(100000)
 * to the camera's move each frame, and that move then decays by `inertia`.
 * The distance travelled is therefore exactly proportional to `camera.speed`,
 * so the camera's speed is raised 20x while the controls are attached.
 *
 * Mouse look is untouched: it turns by pixels / angularSensitivity and then
 * coasts by `inertia`, and neither of those is changed here. (Changing
 * `inertia` instead would also change how far a drag turns the camera.)
 *
 * The returned function detaches the library controls (removing their canvas
 * listeners and per-frame hook) and puts the camera's speed back. This module
 * adds no listeners or per-frame work of its own.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const originalSpeed = camera.speed;
    const boostedSpeed = originalSpeed * MOVE_MULTIPLIER;

    // Set the speed before attaching, so it applies whether the controls read
    // it every frame or only once when they are attached.
    camera.speed = boostedSpeed;

    let detachControls: (() => void) | null;
    try {
        detachControls = attachFreeControl(camera, canvas, scene);
    } catch (error) {
        camera.speed = originalSpeed;
        throw error;
    }

    return () => {
        if (!detachControls) {
            return; // already disposed
        }
        const detach = detachControls;
        detachControls = null;
        detach();
        // Restore the speed unless someone else has set a new one meanwhile.
        if (camera.speed === boostedSpeed) {
            camera.speed = originalSpeed;
        }
    };
}
