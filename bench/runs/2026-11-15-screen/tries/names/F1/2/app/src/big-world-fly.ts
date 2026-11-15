import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const FLY_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera keyboard and mouse controls,
 * with keyboard movement scaled by FLY_SPEED_MULTIPLIER.
 *
 * Movement is scaled by raising `camera.speed` before the default controls are
 * attached, so no per-frame loop of our own is needed. Mouse look is left alone.
 *
 * The returned function detaches the controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const fastSpeed = baseSpeed * FLY_SPEED_MULTIPLIER;
    camera.speed = fastSpeed;

    const detach = attachFreeControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detach();
        // Restore the original speed unless the app changed it while the controls were attached.
        if (camera.speed === fastSpeed) {
            camera.speed = baseSpeed;
        }
    };
}
