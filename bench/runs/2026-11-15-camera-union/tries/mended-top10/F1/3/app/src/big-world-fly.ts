import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const BIG_WORLD_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's fly controls to `camera` on `canvas`, with keyboard
 * movement scaled up by BIG_WORLD_SPEED_MULTIPLIER.
 *
 * Only `camera.speed` is changed. Mouse look is driven by angularSensitivity
 * and inertia, which are left alone, so drag-to-turn behaves as the default.
 * No per-frame callback of our own is registered.
 *
 * Returns a function that detaches the controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSpeed = camera.speed;
    const boostedSpeed = defaultSpeed * BIG_WORLD_SPEED_MULTIPLIER;

    // Set the speed before attaching in case the controls read it at attach time.
    camera.speed = boostedSpeed;
    const detach = attachFreeControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detach();
        // Only restore if nothing else has changed the speed since we set it.
        if (camera.speed === boostedSpeed) {
            camera.speed = defaultSpeed;
        }
    };
}
